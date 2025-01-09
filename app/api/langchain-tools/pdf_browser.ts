import axiosMod, { AxiosStatic } from "axios";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Tool } from "@langchain/core/tools";
import {
  RecursiveCharacterTextSplitter,
  TextSplitter,
} from "langchain/text_splitter";

import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Embeddings } from "@langchain/core/embeddings";
import { formatDocumentsAsString } from "langchain/util/document";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const parseInputs = (inputs: string): [string, string, string] => {
  // Sometimes the inputs are enclosed in brackets, remove them
  if (inputs.startsWith("[") && inputs.endsWith("]")) {
    inputs = inputs.slice(1, -1);
  }
  const [baseUrl, task, search] = inputs.split(",").map((input) => {
    let t = input.trim();
    t = t.startsWith('"') ? t.slice(1) : t;
    t = t.endsWith('"') ? t.slice(0, -1) : t;
    t = t.endsWith("/") ? t.slice(0, -1) : t;
    return t.trim();
  });

  return [baseUrl, task, search];
};

const getPdfBlob = async (baseUrl: string) => {
  const axios = (
    "default" in axiosMod ? axiosMod.default : axiosMod
  ) as AxiosStatic;
  let response;
  try {
    response = await axios.get(baseUrl, {
      responseType: "arraybuffer",
    });
  } catch (e) {
    if (axios.isAxiosError(e) && e.response && e.response.status) {
      throw new Error(`http response ${e.response.status}`);
    }
    throw e;
  }

  const allowedContentTypes = ["application/pdf"];

  const contentType = response.headers["content-type"];
  const contentTypeArray = contentType.split(";");
  if (
    contentTypeArray[0] &&
    !allowedContentTypes.includes(contentTypeArray[0])
  ) {
    throw new Error("returned page was not pdf file");
  }
  const pdfBlob = new Blob([response.data], { type: "application/pdf" });
  return pdfBlob;
};

const getDocsText = (docs: any[]) => {
  let text = "";
  docs.forEach((v) => {
    text += v.pageContent;
  });
  return text;
};

export class PDFBrowser extends Tool {
  static lc_name() {
    return "PDFBrowser";
  }

  get lc_namespace() {
    return [...super.lc_namespace, "pdfbrowser"];
  }

  private model: BaseLanguageModel;

  private embeddings: Embeddings;

  private textSplitter: TextSplitter;

  constructor(model: BaseLanguageModel, embeddings: Embeddings) {
    super();
    this.model = model;
    this.embeddings = embeddings;
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
      chunkOverlap: 200,
    });
  }

  /** @ignore */
  async _call(inputs: string, runManager?: CallbackManagerForToolRun) {
    const [baseUrl, task, search_item] = parseInputs(inputs);
    const doSearch = !search_item.includes("EMPTY");

    let pdfBlob;
    try {
      pdfBlob = await getPdfBlob(baseUrl);
    } catch (e) {
      if (e) {
        return e.toString();
      }
      return "There was a problem connecting to the site";
    }

    const loader = new WebPDFLoader(pdfBlob, { parsedItemSeparator: "" });
    const docs = await loader.load();
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      this.embeddings,
    );

    const texts = await this.textSplitter.splitText(getDocsText(docs));

    const PAGE_CUTOFF_LIMIT = 20;
    const page_cutoff =
      docs.length > PAGE_CUTOFF_LIMIT ? PAGE_CUTOFF_LIMIT : docs.length;

    let context;
    let input;

    if (doSearch) {
      // search term well embed and grab top 10 pages
      const results = await vectorStore.similaritySearch(
        search_item,
        page_cutoff,
        undefined,
        runManager?.getChild("vectorstore"),
      );
      context = formatDocumentsAsString(results);
      input = `Please conduct ${task} relating ${search_item} on the following text,
        you should first read and comprehend the text and find out how ${search_item} is involved in the text\n 
        TEXT:\n ${context}.`;
    } else {
      // In other cases all pages will be used
      context = texts.slice(0, page_cutoff).join("\n");
      input = `Please conduct ${task} on the following text:
        you should first read and comprehend the text before finishing the ${task}\n 
        TEXT:\n ${context}`;
    }

    console.log("[pdf-browser]", input);

    const chain = RunnableSequence.from([this.model, new StringOutputParser()]);
    return chain.invoke(input, runManager?.getChild());
  }

  name = "pdf-browser";

  description = `useful for when you need to deal with pdf files. input should be a comma separated list of items without enclosing brackets. 
  "ONE valid http URL including protocol",
  "plain instruction upon what you want to do with this file",
  "keywords if some searching is requested, set empty tag [EMPTY] if none"`;
}
