import React, { useEffect, useState } from "react";
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
import { VideoFetchStatus } from "./speech-avatar";

const config = getServerSideConfig();

export const submitSpeechAudio = async (
  inputText: string,
  setOutputAvatar: (outputAvatar: IRequestResponse) => void,
) => {
  setOutputAvatar({ status: VideoFetchStatus.Empty, data: "" });

  const subscriptionKey = config.speechAvatarSubscriptionKey;
  const serviceRegion = config.speechAvatarServiceRegion;
  const urlBase = `https://${serviceRegion}.customvoice.api.speech.microsoft.com/api`; // TODO: region should be in

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
      voice: "en-US-JennyNeural", // # set voice name for plain text; ignored for ssml
    },
    properties: {
      outputFormat: "audio-24khz-160kbitrate-mono-mp3",
      // destinationContainerUrl: "https://github.com/xinglin-yu/TestRepo/tree/master/Doc/"
    },
  };

  try {
    const response = await axios.post(
      `${urlBase}/texttospeech/3.1-preview1/batchsynthesis`,
      payload,
      {
        headers: {
          Accept: "application/json",
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status >= 400) {
      setOutputAvatar({ status: VideoFetchStatus.Error, data: response.data });
    } else {
      const jobId = response.data.id;

      // 轮询获取状态
      const pollStatus = async () => {
        try {
          const result = await axios.get(
            `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/${jobId}`,
            {
              headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey,
              },
            },
          );
          if (result.data.status === VideoFetchStatus.Succeeded) {
            console.log(
              "result.data.outputs.result: ",
              result.data.outputs.result,
            );
            setOutputAvatar({
              status: VideoFetchStatus.Succeeded,
              data: result.data.outputs.result,
            });
          } else if (result.data.status === VideoFetchStatus.Failed) {
            setOutputAvatar({
              status: VideoFetchStatus.Failed,
              data: result.data,
            });
          } else {
            setOutputAvatar({ status: VideoFetchStatus.Loading, data: "" });
            setTimeout(pollStatus, 500);
          }
        } catch (error) {
          setOutputAvatar({ status: VideoFetchStatus.Error, data: error });
        }
      };

      pollStatus();
    }
  } catch (error) {
    setOutputAvatar({ status: VideoFetchStatus.Error, data: error });
  }
};

interface SpeechAudioShowProps {
  outputAvatar: IRequestResponse;
}

// TODO: this might be more easy when geting status when show
export const SpeechAudioShow: React.FC<SpeechAudioShowProps> = ({
  outputAvatar,
}) => {
  const [mp3Url, setMp3Url] = useState<string | null>(null);

  useEffect(() => {
    if (outputAvatar.status === VideoFetchStatus.Succeeded) {
      // 当状态为Succeeded时，outputAvatar.data应该包含.zip文件的URL
      const zipUrl = outputAvatar.data;

      // 下载.zip文件并解压展示其中的.mp3文件
      const fetchAndUnzipMP3 = async () => {
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
            setMp3Url(mp3Url);
          }
        } catch (error) {
          console.error("Error fetching or unzipping MP3:", error);
        }
      };

      fetchAndUnzipMP3();
    }
  }, [outputAvatar]);

  if (outputAvatar.status === VideoFetchStatus.Empty) {
    return <></>;
  }

  if (
    outputAvatar.status === VideoFetchStatus.Error ||
    outputAvatar.status === VideoFetchStatus.Failed
  ) {
    return <div>{outputAvatar.data}</div>;
  }

  if (outputAvatar.status === VideoFetchStatus.Loading) {
    return (
      <div>
        <h3 className={styles_tm["video-container"]}>Audio is generating...</h3>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </div>
    );
  }

  if (mp3Url) {
    return (
      <div className={styles_tm["video-container"]}>
        <audio controls style={{ width: "60%" }}>
          <source src={mp3Url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  return <></>;
};
