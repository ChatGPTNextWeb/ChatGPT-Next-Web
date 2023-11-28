import { BaseLanguageModel } from "langchain/dist/base_language";
import { PDFBrowser } from "@/app/api/langchain-tools/pdf_browser";

import { Embeddings } from "langchain/dist/embeddings/base.js";

export class NodeJSTool {
  private apiKey: string | undefined;

  private baseUrl: string;

  private model: BaseLanguageModel;

  private embeddings: Embeddings;

  private callback?: (data: string) => Promise<void>;

  constructor(
    apiKey: string | undefined,
    baseUrl: string,
    model: BaseLanguageModel,
    embeddings: Embeddings,
    callback?: (data: string) => Promise<void>,
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.embeddings = embeddings;
    this.callback = callback;
  }

  async getCustomTools(): Promise<any[]> {
    const pdfBrowserTool = new PDFBrowser(this.model, this.embeddings);
    return [pdfBrowserTool];
  }
}
