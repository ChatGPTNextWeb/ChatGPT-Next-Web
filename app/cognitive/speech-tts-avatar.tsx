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
import { useEffect, useState } from "react";

const config = getServerSideConfig();

export enum VideoFetchStatus {
  Empty = "",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Loading = "Loading",
  Error = "Error",
}

const SUBSCRIPTION_KEY = config.speechAvatarSubscriptionKey;
const URL = `https://${config.speechAvatarServiceRegion}.customvoice.api.speech.microsoft.com/api/texttospeech/3.1-preview1/batchsynthesis/talkingavatar`;

const NAME = "Simple avatar synthesis";
const DESCRIPTION = "Simple avatar synthesis description";

// pure function
export const onSubmitSynthesisAvatar = async (inputText: string) => {
  const header = {
    // Accept: "application/json",
    "Ocp-Apim-Subscription-Key": config.speechAvatarSubscriptionKey,
    "Content-Type": "application/json",
  };

  const payload = {
    displayName: "speech avatar speaking",
    description: "",
    textType: "PlainText",
    inputs: [
      {
        text: inputText,
      },
    ],
    synthesisConfig: {
      voice: "en-US-JennyNeural", // # set voice name for plain text; ignored for ssml
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
    const response = await axios.post(URL, payload, {
      headers: header,
    });

    if (response.status < 400) {
      console.log("Batch avatar synthesis job submitted successfully");

      const job_id = response.data.id;
      console.log(`Job ID: ${job_id}`);
      return job_id;
    } else {
      console.error(`Failed to submit batch avatar synthesis job: ${response}`);
    }
  } catch (error) {
    console.error(`Failed to submit batch avatar synthesis job: ${error}`);
  }
};

// pure function
export const getSynthesisAvatar = async (job_id: string) => {
  const header = {
    // Accept: "application/json",
    "Ocp-Apim-Subscription-Key": config.speechAvatarSubscriptionKey,
    // 'Content-Type': 'application/json'
  };
  try {
    const response = await axios.get(`${URL}/${job_id}`, {
      headers: header,
    });

    if (response.status < 400) {
      return response.data.status;
    } else {
      console.error(`Failed to submit batch avatar synthesis job: ${response}`);
    }
  } catch (error) {
    console.error(`Failed to get batch avatar synthesis job: ${error}`);
  }
};

export function ShowAvatar(props: { job_id: string }) {
  const { job_id } = props;
  const [status, setStatus] = useState("");
  const [avatarVideo, setAvatarVideo] = useState("");

  useEffect(() => {
    let isSubscribed = true;
    const header = {
      // Accept: "application/json",
      "Ocp-Apim-Subscription-Key": config.speechAvatarSubscriptionKey,
      // 'Content-Type': 'application/json'
    };

    const checkStatus = async () => {
      while (isSubscribed) {
        const response = await axios.get(`${URL}/${job_id}`, {
          headers: header,
        });
        const currentStatus = response.data.status;
        if (currentStatus >= 400) {
          console.error(
            `Failed to get batch avatar synthesis job: ${response}`,
          );
        }
        if (currentStatus === "Succeeded") {
          setStatus(currentStatus);
          setAvatarVideo(response.data.outputs.result);
          break;
        }
        if (currentStatus === "Failed") {
          setStatus(currentStatus);
          setAvatarVideo(response.data);
          break;
        } else {
          console.log(
            `batch avatar synthesis job is still running, status [${currentStatus}]`,
          );
          await new Promise((resolve) => setTimeout(resolve, 5000)); // 等待5秒
        }
      }
    };

    if (job_id) {
      checkStatus();
    }

    // 清理函数
    return () => {
      isSubscribed = false;
    };
  }, [job_id]);

  if (status === "Succeeded") {
    return (
      <div className={styles_tm["video-container"]}>
        <video controls width="400" height="300">
          <source src={avatarVideo} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (status === "Failed") {
    return <div>{avatarVideo}</div>;
  }

  return (
    <div>
      <h3 className={styles_tm["video-container"]}>
        Avatar Video is generating...
      </h3>
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    </div>
  );
}

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
