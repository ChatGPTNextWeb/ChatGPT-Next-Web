import { Tool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { formatDocumentsAsString } from "langchain/util/document";
import { Embeddings } from "langchain/dist/embeddings/base.js";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export class RAGSearch extends Tool {
  static lc_name() {
    return "RAGSearch";
  }

  get lc_namespace() {
    return [...super.lc_namespace, "ragsearch"];
  }

  private sessionId: string;
  private model: BaseLanguageModel;
  private embeddings: Embeddings;

  constructor(
    sessionId: string,
    model: BaseLanguageModel,
    embeddings: Embeddings,
  ) {
    super();
    this.sessionId = sessionId;
    this.model = model;
    this.embeddings = embeddings;
  }

  /** @ignore */
  async _call(inputs: string, runManager?: CallbackManagerForToolRun) {
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
    const vectorStore = await PineconeStore.fromExistingIndex(this.embeddings, {
      pineconeIndex,
    });

    let context;
    const returnCunt = process.env.RAG_RETURN_COUNT
      ? parseInt(process.env.RAG_RETURN_COUNT, 10)
      : 4;
    const results = await vectorStore.similaritySearch(inputs, returnCunt, {
      sessionId: this.sessionId,
    });
    context = formatDocumentsAsString(results);
    console.log("[rag-search]", context);
    return context;
    // const input = `Text:${context}\n\nQuestion:${inputs}\n\nI need you to answer the question based on the text.`;

    // console.log("[rag-search]", input);

    // const chain = RunnableSequence.from([this.model, new StringOutputParser()]);
    // return chain.invoke(input, runManager?.getChild());
  }

  name = "rag-search";

  description = `It is used to query documents entered by the user.The input content is the keywords extracted from the user's question, and multiple keywords are separated by spaces and passed in.`;
}
