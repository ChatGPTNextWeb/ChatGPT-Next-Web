import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showConfirm,
  showToast,
  showModal,
} from "../components/ui-lib";

import Locale from "../locales";

import { useAppConfig } from "../store";

import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

import { HttpRequestResponse } from "../store/chat";
import { VideoFetchStatus } from "../cognitive/speech-avatar";

import styles_tm from "../toastmasters/toastmasters.module.scss";

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
          onChange={(e) =>
            (config.avatarVideo.previewCost = e.currentTarget.checked)
          }
          inputProps={{ "aria-label": "controlled" }}
        />
      </ListItem>
    </List>
  );
}

export function SpeechAvatarVideoShow(props: {
  outputAvatar: HttpRequestResponse;
}) {
  const { outputAvatar } = props;

  if (outputAvatar.status === VideoFetchStatus.Empty) {
    return <></>;
  } else if (
    outputAvatar.status === VideoFetchStatus.Error ||
    outputAvatar.status === VideoFetchStatus.Failed
  ) {
    return <div>{outputAvatar.data}</div>;
  } else if (outputAvatar.status === VideoFetchStatus.Loading) {
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
  } else if (outputAvatar.status === VideoFetchStatus.Succeeded) {
    return (
      <div className={styles_tm["video-container"]}>
        <video controls width="800" height="600">
          <source src={outputAvatar.data} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <></>;
}
