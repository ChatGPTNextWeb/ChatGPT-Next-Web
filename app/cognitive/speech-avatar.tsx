import axios from "axios";
import { getServerSideConfig } from "../config/server";

const config = getServerSideConfig();

export enum VideoFetchStatus {
  Empty = "",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Loading = "Loading",
  Error = "Error",
}

// pure function
export const onChatAvatar = async (
  text: string,
  setSessionVideoUrl: (videoUrl: string) => void,
) => {
  setSessionVideoUrl(VideoFetchStatus.Empty);

  const subscriptionKey = config.speechAvatarSubscriptionKey;
  const urlBase = "https://westus2.customvoice.api.speech.microsoft.com/api";

  const ssml =
    '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" xml:lang="zh-CN"><voice name="zh-CN-XiaoxiaoNeural">你好，我是微软AI虚拟人。</voice></speak>';

  const payload = {
    displayName: "avatar test",
    description: "<description>",
    textType: "SSML",
    inputs: [
      {
        text: ssml,
      },
    ],
    synthesisConfig: {
      voice: "en-US-JennyNeural", // # set voice name for plain text; ignored for ssml
    },
    properties: {
      talkingAvatarCharacter: "lisa", // # currently only one platform character (lisa)
      talkingAvatarStyle: "graceful-sitting", // # chosen from 5 styles (casual-sitting, graceful-sitting, graceful-standing, technical-sitting, technical-standing)
      videoFormat: "webm", // # mp4 or webm, webm is required for transparent background
      videoCodec: "vp9", // # hevc, h264 or vp9, vp9 is required for transparent background; default is hevc
      subtitleType: "soft_embedded",
      backgroundColor: "transparent",
    },
  };

  try {
    const response = await axios.post(
      `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar`,
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
      console.log("Job submission failed, check your subscription key");
      console.log(response.data);
      setSessionVideoUrl(VideoFetchStatus.Error);
    } else {
      console.log("Job submitted successfully");
      console.log("response: ", response);
      const jobId = response.data.id;

      // 轮询获取状态
      const pollStatus = async () => {
        try {
          const result = await axios.get(
            `${urlBase}/texttospeech/3.1-preview1/batchsynthesis/talkingavatar/${jobId}`,
            {
              headers: {
                "Ocp-Apim-Subscription-Key": subscriptionKey,
              },
            },
          );

          if (result.data.status === VideoFetchStatus.Succeeded) {
            console.log("Synthesized video:", result.data.outputs.result);
            setSessionVideoUrl(result.data.outputs.result);
          } else if (result.data.status === VideoFetchStatus.Succeeded) {
            console.log("Synthesis failed");
            setSessionVideoUrl(VideoFetchStatus.Succeeded);
          } else {
            console.log("Synthesis in progress, status:", result.data.status);
            setSessionVideoUrl(VideoFetchStatus.Loading);
            setTimeout(pollStatus, 500);
          }
        } catch (error) {
          console.error("Error polling status:", error);
          setSessionVideoUrl(VideoFetchStatus.Error);
        }
      };

      pollStatus();
    }
  } catch (error) {
    console.error("Error submitting job:", error);
    setSessionVideoUrl(VideoFetchStatus.Error);
  }
};
