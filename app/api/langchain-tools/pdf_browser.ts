import axiosMod, { AxiosStatic } from "axios";
import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Tool } from "@langchain/core/tools";
import {
  RecursiveCharacterTextSplitter,
  TextSplitter,
} from "langchain/text_splitter";

import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { formatDocumentsAsString } from "langchain/util/document";
import { Embeddings } from "langchain/dist/embeddings/base.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

export const parseInputs = (inputs: string): [string, string] => {
  const [baseUrl, task] = inputs.split(",").map((input) => {
    let t = input.trim();
    t = t.startsWith('"') ? t.slice(1) : t;
    t = t.endsWith('"') ? t.slice(0, -1) : t;
    t = t.endsWith("/") ? t.slice(0, -1) : t;
    return t.trim();
  });

  return [baseUrl, task];
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
    const [baseUrl, task] = parseInputs(inputs);
    const doSummary = !task;

    let pdfBlob;
    try {
      pdfBlob = await getPdfBlob(baseUrl);
    } catch (e) {
      if (e) {
        return e.toString();
      }
      return "There was a problem connecting to the site";
    }

    const loader = new WebPDFLoader(pdfBlob);
    const docs = await loader.load();
    const vectorStore = await MemoryVectorStore.fromDocuments(
      docs,
      this.embeddings,
    );

    const texts = await this.textSplitter.splitText(getDocsText(docs));

    let context;
    // if we want a summary grab first 4
    if (doSummary) {
      context = texts.slice(0, 4).join("\n");
    }
    // search term well embed and grab top 4
    else {
      const results = await vectorStore.similaritySearch(
        task,
        4,
        undefined,
        runManager?.getChild("vectorstore"),
      );
      context = formatDocumentsAsString(results);
    }

    const input = `Text:${context}\n\nI need ${
      doSummary ? "a summary" : task
    } from the above text.`;

    console.log("[pdf-browser]", input);

    const chain = RunnableSequence.from([this.model, new StringOutputParser()]);
    return chain.invoke(input, runManager?.getChild());
  }

  name = "pdf-browser";

  description = `useful for when you need to find something on or summarize a pdf file. input should be a comma separated list of "ONE valid http URL including protocol","what you want to find on the pdf page or empty string for a summary".`;
}
