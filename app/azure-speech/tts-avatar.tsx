import React, { useState, useRef, useEffect, ChangeEvent } from "react";

import { initRequestResponse, useAppConfig, useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";

import { List, ListItem, showConfirm, showToast } from "../components/ui-lib";
import Locale from "../locales";

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
  EAzureLanguages,
  EAzureSpeechPrice,
} from "./AzureRoles";
import {
  ISubmitAvatarSetting,
  VideoFetchStatus,
  onSynthesisAudio,
  onSynthesisAvatar,
} from "../cognitive/speech-tts-avatar";
import zBotServiceClient, {
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";
import { useMobileScreen } from "../utils";

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
  const config = useAppConfig();
  const updateConfig = config.update;
  const isMobileScreen = useMobileScreen();

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
    // No need, since MP4 Video has caption

    const segmentLength = 5; // interval seconds
    const newSegment = Math.floor(
      parseInt(event.target.currentTime) / segmentLength,
    );

    // 只在分段的起点处显示字幕一次
    if (
      inputCopilot.VideoSrc.lastSegment &&
      inputCopilot.VideoSrc.lastSegment >= 0 &&
      newSegment === inputCopilot.VideoSrc.lastSegment
    )
      return;

    let inputTexts: string[] = [];
    if (inputCopilot.Language === EAzureLanguages.EnglishUnitedStates) {
      inputTexts = inputCopilot.InputText.split(/\s+/);
    } else if (
      inputCopilot.Language === EAzureLanguages.ChineseMandarinSimplified
    ) {
      // TODO: 包括标点符号, 引号等
      const chineseRegex = /[\u4e00-\u9fff]/g; // 匹配中文字符的正则表达式
      const chineseMatches = inputCopilot.InputText.match(chineseRegex); // 获取所有匹配的中文字符数组
      if (!chineseMatches) return;
      inputTexts = chineseMatches;
    }
    const startIndex = Math.floor(
      (newSegment * segmentLength * inputTexts.length) /
        inputCopilot.VideoSrc.duration!,
    );
    const endIndex = Math.floor(
      ((newSegment + 1) * segmentLength * inputTexts.length) /
        inputCopilot.VideoSrc.duration!,
    );

    let subStr: string = "";
    if (inputCopilot.Language === EAzureLanguages.EnglishUnitedStates) {
      subStr = inputTexts.slice(startIndex, endIndex).join(" ");
    } else if (
      inputCopilot.Language === EAzureLanguages.ChineseMandarinSimplified
    ) {
      subStr = inputTexts.slice(startIndex, endIndex).join("");
    }

    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc.caption = subStr;
      inputCopilot.VideoSrc.lastSegment = newSegment;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getInputsString = (): string => {
    return "";
  };

  const getPredictDurationSeconds = (
    text: string,
    language: string,
  ): number => {
    // check coins
    let predictSeconds = 0;

    // Chinese: 100字=>23s video; English: 100wrods=>40s video
    if (language === EAzureLanguages.EnglishUnitedStates) {
      const words = ChatUtility.getWordsNumber(text);
      predictSeconds = Math.ceil((words * 40) / 100);
    } else if (language === EAzureLanguages.ChineseMandarinSimplified) {
      const words = ChatUtility.getWordsNumberChinese(text);
      predictSeconds = Math.ceil((words * 23) / 100);
    }

    return predictSeconds;
  };

  const onPreviewVideo = async () => {
    if (inputCopilot.InputText === "") {
      showToast(`Input Text could not be empty`);
      return;
    }

    // check coins
    let predictSeconds = getPredictDurationSeconds(
      inputCopilot.InputText,
      inputCopilot.Language,
    );
    const predictCost = Math.ceil(EAzureSpeechPrice.TTSAvatar * predictSeconds);
    if (config.avatarVideo.previewCost === true) {
      const isConfirmed = await showConfirm(
        <List>
          <ListItem title={Locale.Settings.AvatarVideo.Title}></ListItem>
          <ListItem title="AI币消耗">
            <p>
              {" "}
              {`数字人视频: ${EAzureSpeechPrice.TTSAvatar} AI币/s, 当前预估: ${predictSeconds} s, 预计消耗 ${predictCost} AI币`}{" "}
            </p>
          </ListItem>
          <ListItem
            title={Locale.Settings.AvatarVideo.PreviewCost.Title}
            subTitle={Locale.Settings.AvatarVideo.PreviewCost.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.avatarVideo.previewCost}
              // TODO
              // onChange={(e) =>
              //   updateConfig(
              //     (config) =>
              //       (config.avatarVideo.previewCost = e.currentTarget.checked),
              //   )
              // }
            ></input>
          </ListItem>
        </List>,
      );
      if (!isConfirmed) return;
    }
    const isEnoughCoins = await chatStore.isEnoughCoins(predictCost);
    if (!isEnoughCoins) {
      return;
    }

    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc = initRequestResponse;
      inputCopilot.VideoSrc.submitting = true;
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
    }
    chatStore.updateCurrentSession((session) => {
      inputCopilot.VideoSrc = response;
      inputCopilot.VideoSrc.submitting = false;
    });
  };

  const onPreviewAudio = async () => {
    if (inputCopilot.InputText === "") {
      showToast(`Input Text could not be empty`);
      return;
    }

    // check coins
    let predictSeconds = getPredictDurationSeconds(
      inputCopilot.InputText,
      inputCopilot.Language,
    );
    const predictCost = Math.ceil(predictSeconds * EAzureSpeechPrice.TTSVoice);
    if (config.avatarVideo.previewCost === true) {
      const isConfirmed = await showConfirm(
        <List>
          <ListItem title={`TTS语音合成`}></ListItem>
          <ListItem title="AI币消耗">
            <p>
              {" "}
              {`TTS语音合成: ${
                EAzureSpeechPrice.TTSAvatar * 60
              } AI币/min, 当前预估: ${predictSeconds} s, 预计消耗 ${predictCost} AI币`}{" "}
            </p>
          </ListItem>
          <ListItem
            title={Locale.Settings.AvatarVideo.PreviewCost.Title}
            subTitle={Locale.Settings.AvatarVideo.PreviewCost.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.avatarVideo.previewCost}
              // TODO
              // onChange={(e) =>
              //   updateConfig(
              //     (config) =>
              //       (config.avatarVideo.previewCost = e.currentTarget.checked),
              //   )
              // }
            ></input>
          </ListItem>
        </List>,
      );
      if (!isConfirmed) return;
    }
    const isEnoughCoins = await chatStore.isEnoughCoins(predictCost);
    if (!isEnoughCoins) {
      return;
    }

    chatStore.updateCurrentSession((session) => {
      inputCopilot.AudioSrc = initRequestResponse;
      inputCopilot.AudioSrc.submitting = true;
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
    }

    chatStore.updateCurrentSession((session) => {
      inputCopilot.AudioSrc = response;
      inputCopilot.AudioSrc.submitting = false;
    });
  };

  const AudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.autoplay = true; // 自动播放
        audioRef.current.controls = true; // 显示控制条
      }
    }, []);

    return <audio ref={audioRef} src={inputCopilot.AudioSrc.data} />;
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
                <div className={styles_tm["flex-column-center"]}>
                  <img
                    src="Azure/lisa-casual-sitting-transparent-bg.png"
                    width="80%"
                  />
                  <h4>Microsoft Azure AI Avatar</h4>
                </div>
              ) : (
                <div className={styles_tm["flex-column-center"]}>
                  <video
                    controls
                    width="80%"
                    preload="metadata"
                    // onTimeUpdate={handleCurrentVideoTimeUpdate}
                  >
                    <source
                      src={inputCopilot.VideoSrc.data}
                      type="video/webm"
                    />
                    Your browser does not support the video tag.
                  </video>
                  <h4>Microsoft Azure AI Avatar</h4>
                  {/* <p>{inputCopilot.VideoSrc.caption}</p> */}
                </div>
              )}
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
            loading={inputCopilot.VideoSrc.submitting}
            variant="contained"
            loadingPosition="start"
            style={{ textTransform: "none" }}
          >
            <span>Generate Video</span>
          </LoadingButton>
          {/* <Button variant="outlined" style={{ textTransform: "none" }}>
            Export video
          </Button> */}
        </Stack>

        <div style={{ marginBottom: "20px" }}></div>

        <List>
          <Stack
            display="flex"
            direction={isMobileScreen ? "column" : "row"}
            spacing={2}
            style={{
              marginTop: "10px",
              marginLeft: "10px",
              marginRight: "10px",
            }}
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
              loading={inputCopilot.AudioSrc.submitting}
              variant="outlined"
              startIcon={<PlayCircleOutlineOutlined />}
              loadingPosition="start"
              style={{ textTransform: "none" }}
            >
              <span>Generate Audio</span>
            </LoadingButton>

            {inputCopilot.AudioSrc.data !== "" && (
              <audio
                controls
                style={{
                  width: isMobileScreen ? "100%" : "30%",
                  height: "40px",
                }}
              >
                <source src={inputCopilot.AudioSrc.data} type="audio/mpeg" />
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
              {ChatUtility.getWordsNumberByLanguage(
                inputCopilot.InputText,
                inputCopilot.Language,
              )}{" "}
              words
            </div>
          </div>
        </List>
      </div>
    </div>
  );
}
