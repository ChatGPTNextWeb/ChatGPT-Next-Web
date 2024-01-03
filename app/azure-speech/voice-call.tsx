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
import ResetIcon from "../icons/reload.svg";
import MenuIcon from "../icons/menu.svg";

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
import Skeleton from "@mui/material/Skeleton";

import ReactLoading from "react-loading";
import { Section, Title, Article, Prop } from "./react-loading";

import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "../toastmasters/ISpeech-Common";
import {
  AzureLanguageToVoicesMap,
  AzureLanguageToLocaleMap,
  AzureLanguageToWelcomeMap,
  AzureTTSAvatarInput,
} from "./AzureRoles";
import {
  ISubmitAvatarSetting,
  VideoFetchStatus,
  onSynthesisAudio,
  onSynthesisAvatar,
} from "../cognitive/speech-tts-avatar";
import { speechRecognizer, speechSynthesizer } from "../cognitive/speech-sdk";
import { Path } from "../constant";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  enum SpeakTurnRoles {
    User = "user",
    GPT = "GPT",
  }

  enum SpeakTurnStage {
    UserSpeaking = "Listening...",
    GPTThinking = "GPT Thinking...",
    GPTSpeaking = "GPT Speaking...",
  }

  const [calling, setCalling] = useState(false);
  const callingRef = useRef(calling);
  /* 使用 useRef 来存储 calling 的引用。useRef 创建的引用对象在值发生变化时，不会重新触发渲染，但能确保在整个组件生命周期内保持同一个引用。
  这样，在 onStopVoiceCall 中改变 calling 的值后，callingRef.current 的值也会立即更新。
  */
  const [currentTurn, setCurrentTurn] = useState("");
  const [currentStage, setCurrentStage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [gptMessage, setGptMessage] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const audioRef = useRef<HTMLAudioElement>();

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
      // TODO: price

      let i = 0;
      const maxSeconds = 60;
      for (; i < maxSeconds; i++) {
        if (!callingRef.current) {
          break; // 提前结束循环 for user Stop Calling
        }

        try {
          setCurrentStage(SpeakTurnStage.UserSpeaking);
          setUserMessage("");
          const userAsk = await speechRecognizer.recognizeOnceAsync(
            AzureLanguageToLocaleMap[language],
          );
          // const userAsk = "who are you";
          // console.log("userAsk: ", userAsk);
          setUserMessage(userAsk);
          setCurrentTurn(SpeakTurnRoles.GPT);
          break;
        } catch (error) {
          // showToast(`Error recognizing in ${i} seconds`);
          // 模拟间隔
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      if (i >= maxSeconds) {
        showToast(`After waiting ${i} seconds, user speech lost`);
        onStopVoiceCall();
      }
    } else if (currentTurn === SpeakTurnRoles.GPT) {
      try {
        setCurrentStage(SpeakTurnStage.GPTThinking);

        // at least 2 coins
        const isEnoughCoins = await chatStore.isEnoughCoins(2);
        if (!isEnoughCoins) {
          onStopVoiceCall();
          return;
        }

        setGptMessage("");

        let gptResponse = "";
        if (userMessage === "") {
          // first welcome
          gptResponse = AzureLanguageToWelcomeMap[language];
        } else {
          chatStore.onUserInput(userMessage);
          await chatStore.waitFinished();
          gptResponse = session.messages[session.messages.length - 1].content;
        }
        // console.log("AI response: ", gptResponse);
        setGptMessage(gptResponse);

        const setting: ISubmitAvatarSetting = {
          Voice: AzureLanguageToVoicesMap[language][voiceNumber].Voice,
        };
        const audioResponse = await onSynthesisAudio(gptResponse, setting);

        if (audioResponse.status !== VideoFetchStatus.Succeeded) {
          showToast(
            `Failed: status=${audioResponse.status}, data=${audioResponse.data}`,
          );
          onStopVoiceCall();
          return;
        }

        setAudioSrc(audioResponse.data);
        setCurrentStage(SpeakTurnStage.GPTSpeaking);
        // await playAudio(audioResponse.data);
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        // setCurrentTurn(SpeakTurnRoles.User);
      } catch (error) {
        console.error("Error fetching AI response:", error);
        showToast(`Error fetching AI response: ${error}`);
        onStopVoiceCall();
      }
    }
  };

  async function handleAudioEnded() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCurrentTurn(SpeakTurnRoles.User);
  }

  const playAudio = async (mp3url: string) => {
    try {
      const audio = new Audio(mp3url);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          resolve(); // 在音频播放结束时 resolve Promise
        };

        audio.onerror = (error) => {
          reject(error); // 如果出现播放错误，则 reject Promise
        };

        audio.play();
      });
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const onStartVoiceCall = () => {
    setCalling(true);
    callingRef.current = true; // 同步更新 useRef 的值
    setCurrentTurn(SpeakTurnRoles.GPT);
  };

  const onStopVoiceCall = () => {
    setCalling(false);
    callingRef.current = false; // 同步更新 useRef 的值

    const audio = audioRef.current;
    if (currentStage === SpeakTurnStage.GPTSpeaking && audio !== undefined) {
      // 这两中方法效果一样
      // audio.src = ''; // 将音频源设置为空字符串
      // audio.load(); // 重新加载音频，停止并重置播放位置
      audio.pause();
      audio.currentTime = 0;
    }

    setCurrentTurn("");
    setCurrentStage("");
    setUserMessage("");
    setGptMessage("");
  };

  const onReset = () => {
    chatStore.resetSession();
    onStopVoiceCall();
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
          <>
            {currentStage === "" && (
              <div className={styles_tm["flex-column-center"]}>
                <AvatarMui
                  src="Azure/VoiceCall3.png"
                  sx={{ width: "25%", height: "25%", marginTop: "20px" }}
                />
              </div>
            )}
            {currentStage === SpeakTurnStage.UserSpeaking && (
              <div className={styles_tm["flex-column-center"]}>
                <h3>{currentStage}</h3>
                <Article>
                  <ReactLoading type={"cylon"} color="blue" />
                </Article>
                <h5 style={{ marginLeft: "10px", marginRight: "10px" }}>
                  {userMessage}
                </h5>
              </div>
            )}
            {currentStage === SpeakTurnStage.GPTThinking && (
              <div className={styles_tm["flex-column-center"]}>
                <h3>{currentStage}</h3>
                <Article>
                  <ReactLoading type={"spinningBubbles"} color="green" />
                </Article>
                <h5 style={{ marginLeft: "10px", marginRight: "10px" }}>
                  {userMessage}
                </h5>
              </div>
            )}
            {currentStage === SpeakTurnStage.GPTSpeaking && (
              <div className={styles_tm["flex-column-center"]}>
                <h3>{currentStage}</h3>
                <Article>
                  <ReactLoading type={"bars"} color="green" />
                </Article>
                <h5 style={{ marginLeft: "10px", marginRight: "10px" }}>
                  {gptMessage}
                </h5>
                {audioSrc !== "" && (
                  <audio
                    controls
                    autoPlay
                    style={{ width: "80%", height: "40px" }}
                    onEnded={handleAudioEnded}
                  >
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}
          </>

          <div style={{ marginBottom: "10px" }}></div>
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
                value={voiceNumber.toString()}
                onChange={handleVoiceChange}
                autoWidth
              >
                {AzureLanguageToVoicesMap[language].map((item, index) => (
                  <MenuItem key={index} value={index.toString()}>
                    {item.Name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {calling === false ? (
              <>
                <IconButton
                  icon={<PhoneIcon />}
                  text="Call Me"
                  className={styles_tm["chat-input-button-submit"]}
                  onClick={onStartVoiceCall}
                />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<ResetIcon />}
                  style={{ textTransform: "none" }}
                  onClick={onReset}
                >
                  Reset
                </Button>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<MenuIcon />}
                  style={{ textTransform: "none" }}
                  onClick={() => navigate(Path.Chat)}
                >
                  To chat
                </Button>
              </>
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
