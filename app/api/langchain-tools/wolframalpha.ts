import { Tool } from "@langchain/core/tools";

export class WolframAlphaTool extends Tool {
  name = "wolfram_alpha_llm";

  description = `A wrapper around Wolfram Alpha. Useful for when you need to answer questions about Math, Science, Technology, Culture, Society and Everyday Life. Input should be a search query. If the result contains an image link, use the markdown syntax to return the image.`;

  constructor() {
    super();
  }

  async _call(query: string) {
    const appid = process.env.WOLFRAM_ALPHA_APP_ID;
    if (!appid) {
      return "`WOLFRAM_ALPHA_APP_ID` Not configured";
    }
    const url = `https://www.wolframalpha.com/api/v1/llm-api?appid=${appid}&input=${encodeURIComponent(
      query,
    )}`;
    console.log("[WolframAlphaTool]", url);
    try {
      const res = await fetch(url, {
        method: "GET",
      });
      const resText = await res.text();
      console.log(resText);
      return resText;
    } catch (ex) {
      console.error("[WolframAlphaTool]", ex);
      return "query error";
    }
  }
}
