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

export class BilibiliMusicRecognitionTool extends Tool implements RequestTool {
  name = "bilibili_music_recognition";

  maxOutputLength = Infinity;

  timeout = 300000;

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
  async _call(query: string) {
    try {
      // let result = await this.doAcrcloudRecognitionUsingMetaprocAPI(searchQuery);
      // parse query
      const [videoAid, pid, targetSec] = query.split(",");
      // check if arguments are valid
      // is videoAid a string of numbers?
      if (!/^\d+$/.test(videoAid)) {
        throw new Error(
          "Invalid videoAid: It should be a string of numbers. If a BVid or a short link is given, please convert it to Aid using av{BVid} format using BiliVideoInfo tool.",
        );
      }

      const result = await this.doAcrcloudRecognitionUsingMetaprocAPI(
        videoAid,
        parseInt(pid),
        parseInt(targetSec),
      );
      // console.log(result)
      return JSON.stringify(result);
    } catch (error) {
      console.error(error);
      return (error as Error).toString();
    }
  }

  async doAcrcloudRecognitionUsingMetaprocAPI(
    videoAid: string,
    pid: number,
    targetSec: number,
  ) {
    // get http://10.0.1.3:32345/api/recog_music_in_bili_video?video_aid=170001&pid=1&target_sec=14

    const url = `http://10.0.1.3:32345/api/recog_music_in_bili_video?video_aid=${videoAid}&pid=${pid}&target_sec=${targetSec}`;

    const headers = {
      "User-Agent": getRandomUserAgent(),
    };

    const response = await this.fetchWithTimeout(
      url,
      { headers },
      this.timeout,
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    var data = await response.json();

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

  description = `A tool that recognizes music in Bilibili videos using ACRCloud API. Input string is in this format: video_aid,pid,target_sec. video_aid is extracted from av{video_aid}, e.g. av170001 means video_aid=170001. pid is the page ID of the video(note: pid starts from 1, not 0). and target_sec is the time in seconds where the recognition is expected to start from. To recognize music that begins with video, use timestamp 0 or 1, which is the most useful case.`;
}
