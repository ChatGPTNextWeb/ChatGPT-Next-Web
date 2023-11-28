import { ArxivAPIWrapper } from "@/app/api/langchain-tools/arxiv";
import { DallEAPIWrapper } from "@/app/api/langchain-tools/dalle_image_generator";
import { StableDiffusionWrapper } from "@/app/api/langchain-tools/stable_diffusion_image_generator";
import { BaseLanguageModel } from "langchain/dist/base_language";
import { Calculator } from "langchain/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { BaiduSearch } from "@/app/api/langchain-tools/baidu_search";
import { DuckDuckGo } from "@/app/api/langchain-tools/duckduckgo_search";
import { GoogleSearch } from "@/app/api/langchain-tools/google_search";
import { Tool, DynamicTool } from "langchain/tools";
import * as langchainTools from "langchain/tools";
import { Embeddings } from "langchain/dist/embeddings/base.js";
import { promises } from "dns";

export class EdgeTool {
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
    // let searchTool: Tool = new DuckDuckGo();
    // if (process.env.CHOOSE_SEARCH_ENGINE) {
    //     switch (process.env.CHOOSE_SEARCH_ENGINE) {
    //         case "google":
    //             searchTool = new GoogleSearch();
    //             break;
    //         case "baidu":
    //             searchTool = new BaiduSearch();
    //             break;
    //     }
    // }
    // if (process.env.BING_SEARCH_API_KEY) {
    //     let bingSearchTool = new langchainTools["BingSerpAPI"](
    //         process.env.BING_SEARCH_API_KEY,
    //     );
    //     searchTool = new DynamicTool({
    //         name: "bing_search",
    //         description: bingSearchTool.description,
    //         func: async (input: string) => bingSearchTool.call(input),
    //     });
    // }
    // if (process.env.SERPAPI_API_KEY) {
    //     let serpAPITool = new langchainTools["SerpAPI"](
    //         process.env.SERPAPI_API_KEY,
    //     );
    //     searchTool = new DynamicTool({
    //         name: "google_search",
    //         description: serpAPITool.description,
    //         func: async (input: string) => serpAPITool.call(input),
    //     });
    // }
    const webBrowserTool = new WebBrowser({
      model: this.model,
      embeddings: this.embeddings,
    });
    const calculatorTool = new Calculator();
    const dallEAPITool = new DallEAPIWrapper(
      this.apiKey,
      this.baseUrl,
      this.callback,
    );
    dallEAPITool.returnDirect = true;
    const stableDiffusionTool = new StableDiffusionWrapper();
    const arxivAPITool = new ArxivAPIWrapper();
    return [
      // searchTool,
      calculatorTool,
      webBrowserTool,
      dallEAPITool,
      stableDiffusionTool,
      arxivAPITool,
    ];
  }
}
