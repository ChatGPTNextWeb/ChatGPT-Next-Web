import { StructuredTool } from "@langchain/core/tools";
import { getRandomUserAgent } from "./ua_tools";
import { z } from "zod";

export interface Headers {
  [key: string]: string;
}

export interface RequestTool {
  headers: Headers;
  maxOutputLength?: number;
  timeout: number;
}

export class BilibiliMusicRecognitionTool
  extends StructuredTool
  implements RequestTool
{
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

  schema = z.object({
    videoAid: z.string().describe("The AID of the video to be recognized"),
    pid: z.number().describe("The page ID of the video, starting from 1"),
    targetSec: z
      .number()
      .describe(
        "The time in seconds where the recognition is expected to start from",
      ),
  });

  /** @ignore */
  async _call({ videoAid, pid, targetSec }: z.infer<typeof this.schema>) {
    try {
      var newVideoAid = videoAid.toString();
      if (!(/^\d+$/.test(newVideoAid) || /^av\d+$/.test(newVideoAid))) {
        throw new Error(
          "Invalid videoAid: It should be a string of numbers. If a BVid or a short link is given, please convert it to Aid number using BiliVideoInfo tool.",
        );
      }
      if (newVideoAid.startsWith("av")) newVideoAid = newVideoAid.slice(2);
      const result = await this.doAcrcloudRecognitionUsingMetaprocAPI(
        newVideoAid,
        typeof pid === "string" ? parseInt(pid) : pid,
        typeof targetSec === "string" ? parseInt(targetSec) : targetSec,
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
    if (!process.env.BILIVID_METAPROCESS_SERVER_ADDRESS) {
      throw new Error(
        "BILIVID_METAPROCESS_SERVER_ADDRESS environment variable is not set. Please set it to the address of the BiliVid metaprocess server.",
      );
    }
    // for reference: https://github.com/fred913/bilivid-metaprocess-server
    const url = `http://${process.env.BILIVID_METAPROCESS_SERVER_ADDRESS}/api/recog_music_in_bili_video?video_aid=${videoAid}&pid=${pid}&target_sec=${targetSec}`;

    const headers = {
      "User-Agent": getRandomUserAgent(),
    };

    const response = await this.fetchWithTimeout(
      url,
      { headers },
      this.timeout,
    );

    if (!response.ok) {
      // unify all errors' type (string result or Error)
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

  description = `A tool that recognizes music in Bilibili videos using ACRCloud API. As for input parameters, videoAid is the AID of the video to be recognized, pid is the page ID of the video(note: pid starts from 1, not 0). and target_sec is the time in seconds where the recognition is expected to start from. To recognize music that begins with video, use timestamp 0 or 1, which is the most useful case.`;
}
