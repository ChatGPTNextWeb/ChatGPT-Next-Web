import axios from "axios";
import { getServerSideConfig } from "../config/server";
import { HttpRequestResponse } from "../store";

const config = getServerSideConfig();

export enum VideoFetchStatus {
  Empty = "",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Loading = "Loading",
  Error = "Error",
}

// pure function
export const onSpeechAvatar = async (
  inputText: string,
  setOutputAvatar: (outputAvatar: HttpRequestResponse) => void,
) => {
  setOutputAvatar({ status: VideoFetchStatus.Empty, data: "" });

  const subscriptionKey = config.speechAvatarSubscriptionKey;
  const urlBase = "https://westus2.customvoice.api.speech.microsoft.com/api";

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
      setOutputAvatar({ status: VideoFetchStatus.Error, data: response.data });
    } else {
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
