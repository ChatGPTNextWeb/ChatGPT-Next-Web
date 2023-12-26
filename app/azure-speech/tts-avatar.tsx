import React, { useState, useRef, useEffect } from "react";

import { useAppConfig, useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";

import { List, showToast } from "../components/ui-lib";

import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  ChatSubmitCheckbox,
  ChatUtility,
  BorderLine,
} from "../toastmasters/chat-common";
import { useScrollToBottom } from "../components/chat";
import { useDebouncedCallback } from "use-debounce";
import { autoGrowTextArea } from "../utils";
import { IScoreMetric } from "../toastmasters/ISpeechRoles";
import { IconButton } from "../components/button";
import SendWhiteIcon from "../icons/send-white.svg";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  LinearProgress,
} from "@mui/material";
import "react-circular-progressbar/dist/styles.css";
import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ButtonGroup from "@mui/joy/ButtonGroup";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import VerifiedIcon from "@mui/icons-material/Verified";
import ReplayCircleFilledIcon from "@mui/icons-material/ReplayCircleFilled";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tabs from "@mui/material/Tabs";
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import CircularProgress from "@mui/material/CircularProgress";
import Rating from "@mui/material/Rating";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import LoadingButton from "@mui/lab/LoadingButton";

import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "../toastmasters/ISpeech-Common";
import { PlayCircleOutlineOutlined } from "@mui/icons-material";
import {
  AvatarDefaultLanguage,
  AzureAvatarLanguageVoices,
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

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [videoSrc, setVideoSrc] = useState(session.inputCopilot?.VideoSrc);

  const [playAudio, setPlayAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState(session.inputCopilot?.AudioSrc);

  const [language, setLanguage] = useState(AvatarDefaultLanguage);
  const [voiceList, setVoiceList] = useState(
    AzureAvatarLanguageVoices[language],
  );
  const [voiceNumber, setVoiceNumber] = useState(0);
  const [tabValue, setTabValue] = React.useState("1");

  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      // 检查 audio 是否为 null
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    }
  };

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

  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
    setVoiceList(AzureAvatarLanguageVoices[event.target.value]);
    setVoiceNumber(0);
  };
  const handleVoiceChange = (event: SelectChangeEvent) => {
    setVoiceNumber(parseInt(event.target.value));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const getInputsString = (): string => {
    return "";
  };

  const onPreviewVideo = async () => {
    if (session.inputCopilot.Text === "") {
      showToast(`Text could not be empty`);
      return;
    }

    setSubmitting(true);
    setVideoSrc("");

    const setting: ISubmitAvatarSetting = {
      Voice: voiceList[voiceNumber].Voice,
    };
    const response = await onSynthesisAvatar(
      session.inputCopilot.Text,
      setting,
    );
    if (response.status !== VideoFetchStatus.Succeeded) {
      showToast(`Failed: status=${response.status}, data=${response.data}`);
      setPlayAudio(false);
      return;
    }

    session.inputCopilot.VideoSrc = response.data;
    setVideoSrc(response.data);
    setSubmitting(false);
  };

  const onPlayAudio = async () => {
    if (session.inputCopilot.Text === "") {
      showToast(`Text could not be empty`);
      return;
    }

    setPlayAudio(true);
    setAudioSrc("");

    const setting: ISubmitAvatarSetting = {
      Voice: voiceList[voiceNumber].Voice,
    };
    const response = await onSynthesisAudio(session.inputCopilot.Text, setting);
    if (response.status !== VideoFetchStatus.Succeeded) {
      showToast(`Failed: status=${response.status}, data=${response.data}`);
      setPlayAudio(false);
      return;
    }

    session.inputCopilot.AudioUrl = response.data;
    setAudioSrc(response.data);
    setPlayAudio(false);
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>

      <div
        className={styles["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <List>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {videoSrc === "" ? (
                <img
                  src="lisa-casual-sitting-transparent-bg.png"
                  alt="lisa-casual-sitting-transparent-background"
                  width="100%"
                />
              ) : (
                <div className={styles_tm["video-container"]}>
                  <video controls width="100%" preload="metadata">
                    <source src={videoSrc} type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              <h4>Microsoft Azure AI Avatar</h4>
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

        <Stack spacing={2} direction="row">
          <LoadingButton
            size="small"
            onClick={onPreviewVideo}
            loading={submitting}
            variant="contained"
            loadingPosition="start"
            style={{ textTransform: "none" }}
          >
            <span>Preview video</span>
          </LoadingButton>
          <Button variant="outlined" style={{ textTransform: "none" }}>
            Export video
          </Button>
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
                value={language}
                onChange={handleLanguageChange}
                autoWidth
              >
                {Object.keys(AzureAvatarLanguageVoices).map((item, index) => (
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
                value={voiceNumber.toString()}
                onChange={handleVoiceChange}
                autoWidth
              >
                {voiceList.map((item, index) => (
                  <MenuItem key={index} value={index.toString()}>
                    {item.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <LoadingButton
              size="small"
              onClick={onPlayAudio}
              loading={playAudio}
              variant="outlined"
              startIcon={<PlayCircleOutlineOutlined />}
              loadingPosition="start"
              style={{ textTransform: "none" }}
            >
              <span>Preview audio</span>
            </LoadingButton>

            {audioSrc !== "" && (
              <audio controls style={{ width: "30%", height: "40px" }}>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
          </Stack>
          <BorderLine></BorderLine>
          <TextField
            label="Input Text"
            defaultValue={session.inputCopilot.Text}
            onChange={(e) => (session.inputCopilot.Text = e.target.value)}
            multiline
            sx={{
              width: "100%",
            }}
          />
        </List>
      </div>
    </div>
  );
}
