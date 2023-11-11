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
  Empty = "",
  Succeeded = "Succeeded",
  Failed = "Failed",
  Loading = "Loading",
  Error = "Error",
}

// pure function
export const onSpeechAvatar = async (
  inputText: string,
  setOutputAvatar: (outputAvatar: IRequestResponse) => void,
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

export function SpeechAvatarVideoSetting() {
  const config = useAppConfig();
  const updateConfig = config.update;

  return (
    <List>
      <ListItem title={Locale.Settings.AvatarVideo.Title}></ListItem>
      <ListItem
        title={Locale.Settings.AvatarVideo.MaxWords.Title}
        subTitle={Locale.Settings.AvatarVideo.MaxWords.SubTitle}
      >
        <input
          type="number"
          defaultValue={config.avatarVideo.maxWords}
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.avatarVideo.maxWords = parseInt(e.currentTarget.value)),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.AvatarVideo.PreviewCost.Title}
        subTitle={Locale.Settings.AvatarVideo.PreviewCost.SubTitle}
      >
        <Switch
          defaultChecked={config.avatarVideo.previewCost}
          onChange={(e) => (config.avatarVideo.previewCost = e.target.checked)}
          inputProps={{ "aria-label": "controlled" }}
        />
      </ListItem>
    </List>
  );
}

export function SpeechAvatarVideoShow(props: {
  outputAvatar: IRequestResponse;
}) {
  const { outputAvatar } = props;

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
        <h3 className={styles_tm["video-container"]}>
          Avatar Video is generating...
        </h3>
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      </div>
    );
  }

  if (outputAvatar.status === VideoFetchStatus.Succeeded) {
    return (
      <div className={styles_tm["video-container"]}>
        <video controls width="400" height="300">
          <source src={outputAvatar.data} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <></>;
}
