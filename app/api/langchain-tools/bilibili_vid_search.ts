import { Tool } from "@langchain/core/tools";
import { getRandomUserAgent } from "./ua_tools";
import { encWbi, getWbiKeys } from "./bili_wbi_tools";

export interface Headers {
  [key: string]: string;
}

export interface RequestTool {
  headers: Headers;
  maxOutputLength?: number;
  timeout: number;
}

export class BilibiliVideoSearchTool extends Tool implements RequestTool {
  name = "bilibili_video_search";

  maxOutputLength = Infinity;

  timeout = 10000;

  constructor(
    public headers: Headers = {},
    { maxOutputLength }: { maxOutputLength?: number } = {},
    { timeout }: { timeout?: number } = {},
  ) {
    super(...arguments);

    this.maxOutputLength = maxOutputLength ?? this.maxOutputLength;
    this.timeout = timeout ?? this.timeout;
  }

  /** @ignore */
  async _call(searchQuery: string) {
    try {
      let result = await this.searchFromBilibili(searchQuery);
      // console.log(result)
      return JSON.stringify(result);
    } catch (error) {
      console.error(error);
      return (error as Error).toString();
    }
  }

  async searchFromBilibili(searchQuery: string, searchType: string = "video") {
    const headers = new Headers();
    headers.append("User-Agent", getRandomUserAgent());
    headers.append(
      "Referer",
      "https://search.bilibili.com/all?keyword=" +
        encodeURIComponent(searchQuery),
    );
    headers.append("Origin", "https://search.bilibili.com");
    headers.append("Cookie", process.env.BILIBILI_COOKIES || "");
    const { img_key, sub_key } = await getWbiKeys();
    const queryString = encWbi(
      {
        keyword: searchQuery.trim(),
        search_type: searchType,
      },
      img_key,
      sub_key,
    );
    const url = `https://api.bilibili.com/x/web-interface/wbi/search/type?${queryString}`;

    const resp = await this.fetchWithTimeout(url, {
      headers: headers,
    });

    let rawData: { [key: string]: any } = await resp.json();
    console.log("[BilibiliVideoSearchTool]", rawData);
    let data: Array<{
      title: string;
      url: string;
      authorName: string;
      authorMid: number;
      viewCount: number;
      durationSeconds: number;
    }> = [];

    rawData.data.result.forEach((element: { [key: string]: any }) => {
      const rawTitle = element.title;
      const title = rawTitle.replace(/<[^>]+>/g, ""); // remove HTML tags
      const url = `https://www.bilibili.com/video/${element.bvid}`;
      const authorName = element.author;
      const authorMid = element.mid;
      const viewCount = element.play;
      const durationHHMM = element.duration;
      var durationSeconds = 0;
      durationHHMM.split(":").forEach((timetag: string) => {
        durationSeconds = durationSeconds * 60 + parseInt(timetag);
      });
      data.push({
        title,
        url,
        authorName,
        authorMid,
        viewCount,
        durationSeconds,
      });
    });
    console.log("[BilibiliVideoSearchTool]", data);
    return data;
  }

  async fetchWithTimeout(
    resource: RequestInfo | URL,
    options = {},
    timeout: number = 30000,
  ) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  }

  description = `A tool that searches for videos on Bilibili. Input string is the search query (use Chinese characters for better results in most cases). Output is a list of video titles and URLs.`;
}
