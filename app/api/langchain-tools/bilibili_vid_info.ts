import { Tool } from "@langchain/core/tools";
import { getRandomUserAgent } from "./ua_tools";

export interface Headers {
  [key: string]: string;
}

export interface RequestTool {
  headers: Headers;
  maxOutputLength?: number;
  timeout: number;
}

export class BilibiliVideoInfoTool extends Tool implements RequestTool {
  name = "bilibili_video_info";

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
  async _call(input: string) {
    try {
      let result = await this.fetchVideoInfo(input);
      // console.log(result)
      return result;
    } catch (error) {
      console.error(error);
      return (error as Error).toString();
    }
  }

  async fetchVideoInfo(prompt: string): Promise<string> {
    const headers = new Headers();
    headers.append("User-Agent", getRandomUserAgent());
    let video_param = "";
    prompt = prompt
      .trim()
      .replaceAll(/https?:\/\//g, "")
      .trim();
    // is it bilibili.com video link?
    // if so, extract the video ID and use it to fetch video info

    if (prompt.startsWith("www.bilibili.com/video/")) {
      // prompt = prompt.split("/")[2];
      prompt = new URL("https://" + prompt).pathname.split("/")[2];
    }
    if (prompt.toLowerCase().startsWith("av")) {
      video_param = `aid=${prompt.slice(2)}`;
    } else if (prompt.toLowerCase().startsWith("bv")) {
      video_param = `bvid=${prompt}`;
    } else if (prompt.startsWith("b23.tv/")) {
      // is it video id (b23.tv/avXXX or b23.tv/BVXXXXXXX)
      const suffix = prompt.split("/")[1];
      if (suffix.startsWith("av")) {
        video_param = `aid=${suffix.slice(2)}`;
      } else if (suffix.startsWith("BV")) {
        video_param = `bvid=${suffix}`;
      } else {
        // short links need special handling
        const resp = await this.fetchWithTimeout("https://" + prompt, {
          redirect: "manual",
        });
        const location =
          resp.headers != null ? resp.headers.get("Location") : resp.url;
        if (location) return await this.fetchVideoInfo(location);
        else return "FAIL: Unable to resolve b23.tv short link.";
      }
    } else {
      return "FAIL: Invalid video ID or URL.";
    }
    const resp = await this.fetchWithTimeout(
      `https://api.bilibili.com/x/web-interface/view?${video_param}`,
      {
        headers: headers,
      },
    );

    let rawData: { [key: string]: any } = await resp.json();
    // console.log("response for", prompt, "is", rawData);
    let data: { [key: string]: string } = {};

    // Keep those: bvid, aid, videos, copyright, tname, title, pubdate, desc, state(values see below), owner, argue_info
    // convert state to string
    const stateConvertDict: { [key: string]: string } = {
      "1": "橙色通过",
      "0": "开放浏览",
      "-1": "待审",
      "-2": "被打回",
      "-3": "网警锁定",
      "-4": "被锁定",
      "-5": "管理员锁定",
      "-6": "修复待审",
      "-7": "暂缓审核",
      "-8": "补档待审",
      "-9": "等待转码",
      "-10": "延迟审核",
      "-11": "视频源待修",
      "-12": "转储失败",
      "-13": "允许评论待审",
      "-14": "临时回收站",
      "-15": "分发中",
      "-16": "转码失败",
      "-20": "创建未提交",
      "-30": "创建已提交",
      "-40": "定时发布",
      "-100": "用户删除",
    };
    data["state"] = stateConvertDict[rawData.data.state.toString()];

    data["bvid"] = rawData.data.bvid;
    data["aid"] = rawData.data.aid;
    data["subVideoCount"] = rawData.data.videos;
    data["copyrightData"] = rawData.data.copyright;
    data["videoTypeName"] = rawData.data.tname;
    data["title"] = rawData.data.title;
    data["publishDate"] = rawData.data.pubdate;
    data["descriptions"] = rawData.data.desc;
    // data["state"] = rawData.data.state.toString();
    data["ownerName"] = rawData.data.owner.name;
    data["argueInfo"] = rawData.data.argue_info;

    return (
      "SUCCESS: Video data should be in this JSON: " + JSON.stringify(data)
    );
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

  description = `A tool that fetches video information from Bilibili. It returns a JSON string containing the video title, uploader, and other information.
Input string must be a Bilibili video ID (e.g. av170001, BV17x411w7KC) or a video link (long or short) on Bilibili (e.g. https://www.bilibili.com/video/av170001, https://b23.tv/BV17x411w7KC).`;
}
