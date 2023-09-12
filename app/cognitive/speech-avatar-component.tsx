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

import { useAppConfig } from "../store";

import Switch from "@mui/material/Switch";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";

import { IRequestResponse } from "../store/chat";
import { VideoFetchStatus } from "../cognitive/speech-avatar";

import styles_tm from "../toastmasters/toastmasters.module.scss";

export function SpeechAvatarVideoSetting() {
  const config = useAppConfig();
  const updateConfig = config.update;

  return (
    <List>
      {/* TODO: Transfor into english */}
      {/* <ListItem title="Speech Avatar Video"></ListItem>
      <ListItem
        title="Max words"
        subTitle={"The max words to generate the video. Cost: 1 word costs 1 AI coin. -1 means no limit."}
      > */}
      <ListItem title="数字人视频播放"></ListItem>
      <ListItem
        title="播放字数"
        subTitle={"生成视频时的播放字数, -1表示无限制字数. 注:1个字消耗1个AI币"}
      >
        <input
          type="text"
          value={config.avatarVideo.maxWords}
          onChange={(e) =>
            updateConfig(
              (config) =>
                (config.avatarVideo.maxWords = parseInt(e.currentTarget.value)),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        // title={"Pop-up Cost Preview"}
        // subTitle={
        //   "Preview how many AI coins will be cost when generating avatar video"
        // }
        title={"预览AI币消耗"}
        subTitle={
          "当生成数字人视频时, 弹窗预览AI币的消耗, 可在·设置·中关闭/开启"
        }
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
        <video controls width="800" height="600">
          <source src={outputAvatar.data} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return <></>;
}
