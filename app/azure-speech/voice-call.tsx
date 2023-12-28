import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  useCallback,
} from "react";

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
import AvatarMui from "@mui/material/Avatar";
import { PlayCircleOutlineOutlined } from "@mui/icons-material";

import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "../toastmasters/ISpeech-Common";
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
import { speechRecognizer } from "../cognitive/speech-sdk";

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

  enum SpeakTurnRoles {
    User = "user",
    GPT = "GPT",
  }

  const [calling, setCalling] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentTurn, setCurrentTurn] = useState(SpeakTurnRoles.GPT); // user or ai

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  // from input
  const [language, setLanguage] = useState(inputCopilot.Language);
  const [voiceNumber, setVoiceNumber] = useState(inputCopilot.VoiceNumber);

  useEffect(() => {
    if (calling === true) {
      onConversation();
    }

    // return () => {
    //   // 在组件卸载或 calling 状态变为 false 时停止循环
    //   setCalling(false);
    // };
  }, [calling, currentTurn]);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const newValue = event.target.value;
    setLanguage(newValue);
    inputCopilot.Language = newValue;
    setVoiceNumber(0);
    inputCopilot.VoiceNumber = 0;
  };
  const handleVoiceChange = (event: SelectChangeEvent) => {
    const newValue = parseInt(event.target.value);
    setVoiceNumber(newValue);
    inputCopilot.VoiceNumber = newValue;
  };

  const getInputsString = (): string => {
    return "";
  };

  const onConversation = async () => {
    if (currentTurn === SpeakTurnRoles.User) {
      let i = 0;
      for (; i < 10; i++) {
        try {
          const userAsk = await speechRecognizer.recognizeOnceAsync("en");
          console.log("userAsk: ", userAsk);
          setCurrentMessage(userAsk);
          setCurrentTurn(SpeakTurnRoles.GPT);
        } catch (error) {
          console.error("Error recognizing user speech:", error);
          // 模拟间隔
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      if (i >= 10) {
        showToast(`Error recognizing user speech after waiting  ${i} seconds`);
        setCalling(false);
      }
    } else {
      try {
        chatStore.onUserInput(currentMessage);
        // let response = "";
        // while (!chatStore.getIsFinished()) // will stuck the page, should not use
        // {
        //   response = session.messages[session.messages.length - 1].content;
        //   setCurrentMessage(response);
        // }
        // console.log("AI response: ", response);

        await chatStore.waitFinished();
        let response = session.messages[session.messages.length - 1].content;
        console.log("AI response: ", response);
        setCurrentMessage(response);
        setCurrentTurn(SpeakTurnRoles.User);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        showToast(`Error fetching AI response: ${error}`);
        setCalling(false);
      }
    }
  };

  const onStartVoiceCall = async () => {
    setCalling(true);
    setCurrentTurn(SpeakTurnRoles.User);
  };

  const onStopVoiceCall = async () => {
    setCalling(false);
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <AvatarMui
              src="Azure/VoiceCall4.png"
              sx={{ width: "25%", height: "25%", marginTop: "20px" }}
            />
            <h4>{`${
              currentTurn === SpeakTurnRoles.User
                ? SpeakTurnRoles.GPT
                : SpeakTurnRoles.User
            }: ${currentMessage}`}</h4>
          </div>
        </List>

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
                {AzureAvatarLanguageVoices[language].map((item, index) => (
                  <MenuItem key={index} value={index.toString()}>
                    {item.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {calling === false ? (
              <IconButton
                icon={<PhoneIcon />}
                text="Call Me"
                className={styles_tm["chat-input-button-submit"]}
                onClick={onStartVoiceCall}
              />
            ) : (
              <IconButton
                icon={<PhoneIcon />}
                text="Stop Calling"
                className={styles_tm["chat-input-button-submitting"]}
                onClick={onStopVoiceCall}
              />
            )}
          </Stack>
          <div style={{ marginBottom: "10px" }}></div>
        </List>
      </div>
    </div>
  );
}
