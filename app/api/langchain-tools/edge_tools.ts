import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { Embeddings } from "@langchain/core/embeddings";
import { ArxivAPIWrapper } from "@/app/api/langchain-tools/arxiv";
import { DallEAPIWrapper } from "@/app/api/langchain-tools/dalle_image_generator";
import { StableDiffusionWrapper } from "@/app/api/langchain-tools/stable_diffusion_image_generator";
import { Calculator } from "@langchain/community/tools/calculator";
import { WebBrowser } from "langchain/tools/webbrowser";
import { WolframAlphaTool } from "@/app/api/langchain-tools/wolframalpha";
import { BilibiliVideoInfoTool } from "./bilibili_vid_info";
import { BilibiliVideoSearchTool } from "./bilibili_vid_search";
import { BilibiliVideoConclusionTool } from "./bilibili_vid_conclusion";
import { BilibiliMusicRecognitionTool } from "./bilibili_music_recognition";

export class EdgeTool {
  private apiKey: string | undefined;

  private baseUrl: string;

  private model: BaseLanguageModel;

  private embeddings: Embeddings | null;

  private callback?: (data: string) => Promise<void>;

  constructor(
    apiKey: string | undefined,
    baseUrl: string,
    model: BaseLanguageModel,
    embeddings: Embeddings | null,
    callback?: (data: string) => Promise<void>,
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.embeddings = embeddings;
    this.callback = callback;
  }

  async getCustomTools(): Promise<any[]> {
    const calculatorTool = new Calculator();
    const dallEAPITool = new DallEAPIWrapper(
      this.apiKey,
      this.baseUrl,
      this.callback,
    );
    const stableDiffusionTool = new StableDiffusionWrapper();
    const arxivAPITool = new ArxivAPIWrapper();
    const wolframAlphaTool = new WolframAlphaTool();
    const bilibiliVideoInfoTool = new BilibiliVideoInfoTool();
    const bilibiliVideoSearchTool = new BilibiliVideoSearchTool();
    const bilibiliVideoConclusionTool = new BilibiliVideoConclusionTool();
    const bilibiliMusicRecognitionTool = new BilibiliMusicRecognitionTool();
    let tools = [
      calculatorTool,
      // webBrowserTool,
      dallEAPITool,
      stableDiffusionTool,
      arxivAPITool,
      wolframAlphaTool,
      bilibiliVideoInfoTool,
      bilibiliVideoSearchTool,
      bilibiliMusicRecognitionTool,
      bilibiliVideoConclusionTool,
    ];
    if (this.embeddings != null) {
      const webBrowserTool = new WebBrowser({
        model: this.model,
        embeddings: this.embeddings,
      });
      tools.push(webBrowserTool);
    }
    return tools;
  }
}
