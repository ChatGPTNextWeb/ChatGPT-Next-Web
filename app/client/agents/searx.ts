import { SearxPath, REQUEST_TIMEOUT_MS } from "@/app/constant";

export class SearxApi {
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  public path(path: string): string {
    let url = this.url;
    if (url.endsWith("/")) {
      url = url.slice(0, url.length - 1);
    }
    return [url, path].join("/");
  }

  public async searxSearch(query: string, pageno: number = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const res = await fetch(
      this.path(
        `search?format=json&q=${encodeURIComponent(query)}&pageno=${pageno}`,
      ),
      {
        method: "GET",
        signal: controller.signal,
        headers,
      },
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Fetch Searx results failed, status: ${res.status}`);
    }

    if (!res.ok) {
      throw new Error(`Fetch Searx results failed, status: ${res.status}`);
	      }

    let result = await res.json();
    let finalResult = "联网未搜索到相关信息,请直接回答";

    if (!!result) {
      // Extract answers
      let answersString = "";
      if (result?.answers?.length > 0) {
        for (let i = 0; i < result?.answers?.length; i++) {
          answersString += `${i + 1}. ${result?.answers[i]}\n`;
        }
      } else {
        answersString = "无answer结果\n";
      }

      // Extract content from results
      let resultsString = "";
      if (result?.results?.length > 0) {
        for (let i = 0; i < result?.results?.length; i++) {
          resultsString += `${i + 1}. ${result?.results[i].content}\n`;
        }
      } else {
        resultsString = "无result结果\n";
      }

      // Combine answers, results, and query
      finalResult = `通过网络搜索到的相关信息如下:\n答案:\n${answersString}结果:\n${resultsString}请结合我的搜索结果回答我的问题`;
    }

    return finalResult;
  }
}