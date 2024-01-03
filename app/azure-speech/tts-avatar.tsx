import React, { useState, useRef, useEffect, ChangeEvent } from "react";

import { useAppConfig, useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";

import { List, showToast } from "../components/ui-lib";

import {
  ChatTitle,
  ChatUtility,
  BorderLine,
} from "../toastmasters/chat-common";

import "react-circular-progressbar/dist/styles.css";
import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import { PlayCircleOutlineOutlined } from "@mui/icons-material";
import {
  AzureLanguageToVoicesMap,
  AzureRoles,
  AzureTTSAvatarInput,
} from "./AzureRoles";
import {
  ISubmitAvatarSetting,
  VideoFetchStatus,
  onSynthesisAudio,
  onSynthesisAvatar,
} from "../cognitive/speech-tts-avatar";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  useEffect(() => {
    // 在组件加载时初始化 inputCopilot
    if (!session.inputCopilot) {
      chatStore.updateCurrentSession((session) => {
        session.inputCopilot = new AzureTTSAvatarInput();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组表示这个 effect 只在组件挂载时运行一次

  // 检查 inputCopilot 是否已初始化
  if (!session || !session.inputCopilot) {
    return <div>Loading...</div>; // 或其他的加载指示
  }

  return <ChatCore inputCopilot={session.inputCopilot}></ChatCore>;
}

export function ChatCore(props: { inputCopilot: AzureTTSAvatarInput }) {
  const { inputCopilot } = props;
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const [previewVideo, setPreviewVideo] = useState(false);
  const [previewAudio, setPreviewAudio] = useState(false);

  // Notes: should not use local useState from input, since when change session, the useState will not update
  // const [inputText, setInputText] = useState(inputCopilot.InputText);
  const [tabValue, setTabValue] = React.useState("1");

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value;
    chatStore.updateCurrentSession((session) => {
      inputCopilot.Language = newValue;
      inputCopilot.VoiceNumber = 0;
    });
  };
  const handleVoiceChange = (event: SelectChangeEvent) => {
    const newValue = parseInt(event.target.value);
    chatStore.updateCurrentSession((session) => {
      inputCopilot.VoiceNumber = newValue;
    });
  };
  const handleInputTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const newValue = event.target.value;
    chatStore.updateCurrentSession((session) => {
      inputCopilot.InputText = newValue;
    });
  };

  const handleCurrentVideoTimeUpdate = (event: any) => {
    const segmentLength = 5; // interval seconds
    const newTime = event.target.currentTime;

    // 只在分段的起点处显示字幕一次
    if (newTime % segmentLength !== 0) return;

    const newSegment = Math.floor(
      parseInt(event.target.currentTime) / segmentLength,
    );

    const inputTexts = inputCopilot.InputText.split(/\s+/);
    const startIndex = Math.round(
      (newSegment * segmentLength * inputTexts.length) /
        parseInt(inputCopilot.VideoSrc.duration!),
    );
    const endIndex = Math.round(
      ((newSegment + 1) * segmentLength * inputTexts.length) /
        parseInt(inputCopilot.VideoSrc.duration!),
    );

    const subStr = inputTexts.slice(startIndex, endIndex).join(" ");
    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc.caption = subStr;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getInputsString = (): string => {
    return "";
  };

  const onPreviewVideo = async () => {
    if (inputCopilot.InputText === "") {
      showToast(`Input Text could not be empty`);
      return;
    }

    setPreviewVideo(true);
    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc = { status: "", data: "", duration: "" };
    });

    const setting: ISubmitAvatarSetting = {
      Voice:
        AzureLanguageToVoicesMap[inputCopilot.Language][
          inputCopilot.VoiceNumber
        ].Voice,
    };
    const response = await onSynthesisAvatar(inputCopilot.InputText, setting);
    if (response.status !== VideoFetchStatus.Succeeded) {
      showToast(`Failed: status=${response.status}, data=${response.data}`);
      setPreviewVideo(false);
      return;
    }
    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc = response;
    });
    setPreviewVideo(false);
  };

  const onPreviewAudio = async () => {
    if (inputCopilot.InputText === "") {
      showToast(`Input Text could not be empty`);
      return;
    }

    setPreviewAudio(true);
    chatStore.updateCurrentSession((session) => {
      inputCopilot.AudioSrc = "";
    });

    const setting: ISubmitAvatarSetting = {
      Voice:
        AzureLanguageToVoicesMap[inputCopilot.Language][
          inputCopilot.VoiceNumber
        ].Voice,
    };
    const response = await onSynthesisAudio(inputCopilot.InputText, setting);
    if (response.status !== VideoFetchStatus.Succeeded) {
      showToast(`Failed: status=${response.status}, data=${response.data}`);
      setPreviewAudio(false);
      return;
    }

    chatStore.updateCurrentSession((session) => {
      inputCopilot.AudioSrc = response.data;
    });
    setPreviewAudio(false);
  };

  const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.autoplay = true; // 自动播放
        audioRef.current.controls = true; // 显示控制条
      }
    }, []);

    return <audio ref={audioRef} src={inputCopilot.AudioSrc} />;
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>

      <div className={styles["chat-body"]}>
        <List>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                // width: "100%",
              }}
            >
              {inputCopilot.VideoSrc.data === "" ? (
                <img
                  src="Azure/lisa-casual-sitting-transparent-bg.png"
                  width="80%"
                />
              ) : (
                <div className={styles_tm["flex-column-center"]}>
                  <video
                    controls
                    width="80%"
                    preload="metadata"
                    onTimeUpdate={handleCurrentVideoTimeUpdate}
                  >
                    <source
                      src={inputCopilot.VideoSrc.data}
                      type="video/webm"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              <h4>Microsoft Azure AI Avatar</h4>
              <p>{inputCopilot.VideoSrc.caption}</p>
            </div>

            {/* <Box sx={{ typography: 'body1' }}>
              <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                    <Tab label="Avatar" value="1" />
                    <Tab label="Background" value="2" />
                  </TabList>
                </Box>
                <TabPanel value="1">Item One</TabPanel>
                <TabPanel value="2">Item Two</TabPanel>
              </TabContext>
            </Box> */}
          </div>
        </List>

        <Stack spacing={2} direction="row" justifyContent="center">
          <LoadingButton
            size="small"
            onClick={onPreviewVideo}
            loading={previewVideo}
            variant="contained"
            loadingPosition="start"
            style={{ textTransform: "none" }}
          >
            <span>Preview video</span>
          </LoadingButton>
          {/* <Button variant="outlined" style={{ textTransform: "none" }}>
            Export video
          </Button> */}
        </Stack>

        <div style={{ marginBottom: "20px" }}></div>

        <List>
          <Stack
            display="flex"
            direction="row"
            spacing={2}
            style={{ marginTop: "10px", marginLeft: "10px" }}
          >
            <FormControl sx={{ m: 1, minWidth: 180 }} size="small">
              <InputLabel sx={{ background: "white", paddingRight: "4px" }}>
                Language
              </InputLabel>
              <Select
                value={inputCopilot.Language}
                onChange={handleLanguageChange}
                autoWidth
              >
                {Object.keys(AzureLanguageToVoicesMap).map((item, index) => (
                  <MenuItem key={index} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel sx={{ background: "white", paddingRight: "4px" }}>
                Voice
              </InputLabel>
              <Select
                value={inputCopilot.VoiceNumber.toString()}
                onChange={handleVoiceChange}
                autoWidth
              >
                {AzureLanguageToVoicesMap[inputCopilot.Language].map(
                  (item, index) => (
                    <MenuItem key={index} value={index.toString()}>
                      {item.Name}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
            <LoadingButton
              size="small"
              onClick={onPreviewAudio}
              loading={previewAudio}
              variant="outlined"
              startIcon={<PlayCircleOutlineOutlined />}
              loadingPosition="start"
              style={{ textTransform: "none" }}
            >
              <span>Preview audio</span>
            </LoadingButton>

            {inputCopilot.AudioSrc !== "" && (
              <audio controls style={{ width: "30%", height: "40px" }}>
                <source src={inputCopilot.AudioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </Stack>
          <BorderLine></BorderLine>
          <div style={{ position: "relative", display: "flex", flex: 1 }}>
            <TextField
              label="Input Text"
              value={inputCopilot.InputText}
              onChange={handleInputTextChange}
              multiline
              sx={{
                width: "100%",
                marginTop: "10px",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: "20px",
                top: "-10px",
                opacity: 0.5,
                fontSize: "12px",
              }}
            >
              {ChatUtility.getWordsNumber(inputCopilot.InputText)} words
            </div>
          </div>
        </List>
      </div>
    </div>
  );
}
