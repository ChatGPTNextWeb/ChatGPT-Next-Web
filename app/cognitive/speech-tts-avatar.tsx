import { useEffect, useState } from "react";
import JSZip from "jszip";
import axios from "axios";
import { getServerSideConfig } from "../config/server";

import { List, ListItem } from "../components/ui-lib";

import Locale from "../locales";

import { useAppConfig } from "../store";

import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

import { IRequestResponse } from "../store/chat";

import styles_tm from "../toastmasters/toastmasters.module.scss";

const config = getServerSideConfig();

export enum VideoFetchStatus {
  // Empty = "",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Loading = "Loading",
  // Error = "Error",
}

const subscriptionKey = config.speechAvatarSubscriptionKey;
const serviceRegion = config.speechAvatarServiceRegion;

export interface ISubmitAvatarSetting {
  Voice: string;
}

export const onSynthesisAvatar = async (
  inputText: string,
  setting: ISubmitAvatarSetting,
): Promise<IRequestResponse> => {
  const header = {
    // Accept: "application/json",
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "Content-Type": "application/json",
  };
  const url = `https://${serviceRegion}.customvoice.api.speech.microsoft.com/api/texttospeech/3.1-preview1/batchsynthesis/talkingavatar`;

  const payload = {
    displayName: "speech avatar speaking", // TODO: add user email
    description: "",
    textType: "PlainText",
    inputs: [
      {
        text: inputText,
      },
    ],
    synthesisConfig: {
      voice: setting.Voice,
    },
    properties: {
      talkingAvatarCharacter: "lisa", // # currently only one platform character (lisa)
      talkingAvatarStyle: "casual-sitting", // # chosen from 5 styles (casual-sitting, graceful-sitting, graceful-standing, technical-sitting, technical-standing)
      videoFormat: "webm", // # mp4 or webm, webm is required for transparent background
      videoCodec: "vp9", // # hevc, h264 or vp9, vp9 is required for transparent background; default is hevc
      subtitleType: "soft_embedded",
      backgroundColor: "white", // # white or transparent
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: header,
    });

    if (response.status >= 400) {
      console.error(`Failed to submit batch avatar synthesis job: ${response}`);
      return { status: VideoFetchStatus.Failed, data: response.data };
    }

    const job_id = response.data.id;
    console.log(`Job ID: ${job_id}`);

    while (true) {
      const response = await axios.get(`${url}/${job_id}`, {
        headers: header,
      });
      const currentStatus = response.data.status;
      if (currentStatus >= 400) {
        console.error(`Failed to get batch avatar synthesis job: ${response}`);
      }
      if (currentStatus === "Succeeded") {
        // Get duration
        const summaryResponse = await axios.get(
          `${response.data.outputs.summary}`,
          {
            headers: header,
          },
        );
        if (summaryResponse.data.status !== "Succeeded") {
          return {
            status: VideoFetchStatus.Failed,
            data: summaryResponse.data,
          };
        }

        return {
          status: VideoFetchStatus.Succeeded,
          data: response.data.outputs.result,
          duration:
            summaryResponse.data.results[0].billingDetails
              .TalkingAvatarDuration,
        };
      }
      if (currentStatus === "Failed") {
        return {
          status: VideoFetchStatus.Failed,
          data: response.data,
        };
      } else {
        // console.log(
        //   `batch avatar synthesis job is still running, status [${currentStatus}]`,
        // );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
      }
    }
  } catch (error) {
    console.error(`Failed to submit batch avatar synthesis job: ${error}`);
    return {
      status: VideoFetchStatus.Failed,
      data: error,
    };
  }
};

export const onSynthesisAudio = async (
  inputText: string,
  setting: ISubmitAvatarSetting,
): Promise<IRequestResponse> => {
  const header = {
    Accept: "application/json",
    "Ocp-Apim-Subscription-Key": subscriptionKey,
    "Content-Type": "application/json",
  };
  const url = `https://${serviceRegion}.customvoice.api.speech.microsoft.com/api/texttospeech/3.1-preview1/batchsynthesis`;

  const payload = {
    displayName: "speech audio synthesis",
    description: "",
    textType: "PlainText",
    inputs: [
      {
        text: inputText,
      },
    ],
    synthesisConfig: {
      voice: setting.Voice,
    },
    properties: {
      outputFormat: "audio-24khz-160kbitrate-mono-mp3",
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: header,
    });

    if (response.status >= 400) {
      console.error(`Failed to submit batch avatar synthesis job: ${response}`);
      return { status: VideoFetchStatus.Failed, data: response.data };
    }

    const job_id = response.data.id;
    console.log(`Job ID: ${job_id}`);

    while (true) {
      const response = await axios.get(`${url}/${job_id}`, {
        headers: header,
      });
      const currentStatus = response.data.status;
      if (currentStatus >= 400) {
        console.error(`Failed to get batch avatar synthesis job: ${response}`);
      }
      if (currentStatus === "Succeeded") {
        // 下载.zip文件并解压展示其中的.mp3文件
        const fetchAndUnzipMP3 = async (zipUrl: string) => {
          try {
            const response = await axios.get(zipUrl, { responseType: "blob" });
            const zipBlob = response.data;

            const jszip = new JSZip();
            const zip = await jszip.loadAsync(zipBlob);

            // 假定.zip文件中只有一个.mp3文件
            const mp3File = Object.keys(zip.files).find((fileName) =>
              fileName.endsWith(".mp3"),
            );

            if (mp3File) {
              const mp3Blob = await zip.files[mp3File].async("blob");
              const mp3Url = URL.createObjectURL(mp3Blob);
              console.log("mp3Url: ", mp3Url);
              return mp3Url;
            }
          } catch (error) {
            console.error("Error fetching or unzipping MP3:", error);
          }
        };

        const mp3Url = await fetchAndUnzipMP3(response.data.outputs.result);
        // const mp3Url = response.data.outputs.result;
        return {
          status: VideoFetchStatus.Succeeded,
          data: mp3Url,
        };
      }
      if (currentStatus === "Failed") {
        return {
          status: VideoFetchStatus.Failed,
          data: response.data,
        };
      } else {
        // console.log(
        //   `batch avatar synthesis job is still running, status [${currentStatus}]`,
        // );
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒
      }
    }
  } catch (error) {
    console.error(`Failed to submit batch avatar synthesis job: ${error}`);
    return {
      status: VideoFetchStatus.Failed,
      data: error,
    };
  }
};

/*
Public preview: 2023/12
100 words = 40s video => GenerateTime: 40 seconds
1 word => 0.4 seconds

Previous private preview: 2023/09
100 words = 48s video => GenerateTime: 4 miniutes = 240 seconds
1 word => 2.4 seconds

100 words = 1$ = 7.2 RMB = 72 Coins
1 words => 0.7 Coins
*/
