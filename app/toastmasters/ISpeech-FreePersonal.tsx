import React, { useEffect, useState } from "react";
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useAppConfig, useChatStore } from "../store";

import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import ButtonGroup from "@mui/joy/ButtonGroup";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
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

import {
  audioSpeechToText,
  speechRecognizer,
  speechSynthesizer,
} from "../cognitive/speech-sdk";

import {
  IQuestionItem,
  ImpromptuSpeechInput,
  ImpromptuSpeechPrompts,
  ImpromptuSpeechRoles,
  ImpromptuSpeechStage,
  SpeechDefaultLangugage,
} from "./ISpeechRoles";
import ReactMarkdown from "react-markdown";
import { LinearProgressWithLabel } from "./ISpeech-Common";
import {
  AudioRecorder,
  StageStatus,
} from "../cognitive/speech-audioRecorderClass";
import { useAudioRecorder } from "../cognitive/speech-audioRecorder";

import _ from "lodash";
import { useNavigate } from "react-router-dom";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";
import { List, ListItem, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import { Markdown } from "../components/exporter";
import { useScrollToBottom } from "../components/chat";
import SendWhiteIcon from "../icons/send-white.svg";

import { ChatTitle, BorderLine } from "./chat-common";

import styles from "./ISpeech.module.scss";

export const FreePersonalQuestionPage = (props: {
  scrollRef: React.RefObject<HTMLDivElement>;
  impromptuSpeechInput: ImpromptuSpeechInput;
}) => {
  let { scrollRef, impromptuSpeechInput } = props;
  const questionItems = impromptuSpeechInput.QuestionItems;
  const questionNums = questionItems.length;

  const [evaluationRole, setEvaluationRole] = React.useState<string>(
    ImpromptuSpeechRoles.General,
  );

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const config = useAppConfig();

  // local state used for reder page
  const [currentNum, setCurrentNum] = useState(0);
  const [evaluating, setEvaluating] = useState(
    Object.keys(questionItems[currentNum].Evaluations).length > 0,
  );

  // 需要实时刷新页面的, 就用useState, 否则直接用内部状态
  const [speechTime, setSpeechTime] = useState(
    questionItems[currentNum].SpeechTime,
  );

  const [recordingStatus, setRecordingStatus] = useState(StageStatus.Start);
  const [recorder, setRecorder] = useState(
    new AudioRecorder(setRecordingStatus),
  );

  // 当currentNum变化时, 更新初始值
  useEffect(() => {
    setSpeechTime(questionItems[currentNum].SpeechTime);
    // setRecordingStatus(StageStatus.Start)
    recorder.resetRecording();
  }, [currentNum, questionItems, recorder]);

  // useEffect(() => {
  //   recorder.resetRecording();
  // }, [currentNum, recorder]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recordingStatus === StageStatus.Recording) {
      intervalId = setInterval(() => {
        setSpeechTime((prevTime) => prevTime + 1); // 用于刷新页面
        questionItems[currentNum].SpeechTime = speechTime; // 用于保存状态
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [currentNum, questionItems, recordingStatus, speechTime]);

  const appendUserInput = (newState: string): void => {
    // 每次按下button时 换行显示
    if (questionItems[currentNum].Speech === "") {
      questionItems[currentNum].Speech = newState;
    } else {
      questionItems[currentNum].Speech += "\n" + newState;
    }
    console.log("newState: ", newState);
  };

  const onRecord = () => {
    recorder.startRecording();
    speechRecognizer.startRecording(appendUserInput, SpeechDefaultLangugage);
  };

  const onPause = () => {
    recorder.pauseRecording();
    speechRecognizer.stopRecording();
  };

  const onPlay = () => {
    questionItems[currentNum].SpeechAudio = recorder.getAudioData();
    const audioData = questionItems[currentNum].SpeechAudio;
    console.log("onPlayRecording: ", audioData);
    if (audioData) {
      const audioUrl = URL.createObjectURL(audioData);
      const audio = new Audio(audioUrl);
      audio.play();
    }
    console.log(
      "questionItems[currentNum].Speech:",
      questionItems[currentNum].Speech,
    );
  };

  // TODO: 会点击2次, 才能切换
  const onReset = () => {
    // 清存储
    questionItems[currentNum].ResetCurrent(); // TODO: don't know why this error
    // questionItems[currentNum].Speech = "";
    // questionItems[currentNum].SpeechTime = 0;
    // questionItems[currentNum].SpeechAudio = null;
    // questionItems[currentNum].Score = 0;
    // questionItems[currentNum].Evaluations = {};
    // 改状态
    setSpeechTime(0);
    setRecordingStatus(StageStatus.Start);
    setEvaluating(false);
    recorder.resetRecording();
  };

  const onStop = () => {
    recorder.stopRecording();
  };

  // TODO: 打分还不太准确
  const onScore = () => {
    recorder.stopRecording();

    console.log("onScore: Speech: ", questionItems[currentNum].Speech);

    // reset status from 0
    // chatStore.resetSessionFromIndex(2);

    let ask = ImpromptuSpeechPrompts.GetScorePrompt(
      currentNum,
      questionItems[currentNum].Question,
      questionItems[currentNum].Speech,
    );
    chatStore.onUserInput(ask);
    chatStore.getIsFinished().then(() => {
      const response = session.messages[session.messages.length - 1].content;
      console.log("score: ", response);
      chatStore.updateCurrentSession(
        (session) => (questionItems[currentNum].Score = parseInt(response)),
      );
    });
    // await chatStore.getIsFinished();
    // const response = session.messages[session.messages.length - 1].content;
    // console.log("score: ", response);
    // chatStore.updateCurrentSession(
    //   (session) => (questionItems[currentNum].Score = parseInt(response)),
    // );

    // finilly get the audio, so it not missing any sentence
    questionItems[currentNum].SpeechAudio = recorder.getAudioData();
    console.log(
      "onScore: SpeechAudio: ",
      questionItems[currentNum].SpeechAudio,
    );
    if (questionItems[currentNum].SpeechAudio === null) {
      showToast("Speech is empty");
      return;
    }
  };

  const evaluationRoles = ImpromptuSpeechPrompts.GetEvaluationRoles();

  const onEvaluation = async (event: { preventDefault: () => void }) => {
    setEvaluating(true);
    // TODO:
    questionItems[currentNum].Speech = questionItems[currentNum].SampleSpeech;

    if (
      questionItems[currentNum].Speech === "" ||
      questionItems[currentNum].Speech === undefined
    ) {
      event.preventDefault();
      showToast("Speech is empty");
      return;
    }

    chatStore.resetSessionFromIndex(2);

    let propmts = ImpromptuSpeechPrompts.GetEvaluationPrompts(
      currentNum,
      questionItems[currentNum].Question,
      questionItems[currentNum].Speech,
    );

    for (const role of evaluationRoles) {
      chatStore.onUserInput(propmts[role]);
      await chatStore.getIsFinished();
      const response = session.messages[session.messages.length - 1].content;
      console.log("response: ", response);
      chatStore.updateCurrentSession(
        (session) => (questionItems[currentNum].Evaluations[role] = response),
      );
    }
    await chatStore.getIsFinished();

    chatStore.resetSessionFromIndex(2);
    setEvaluating(false);
  };

  const handleChangeEvaluationRole = (
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setEvaluationRole(newValue);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onReturn = () => {
    chatStore.updateCurrentSession(
      (session) =>
        (impromptuSpeechInput.ActivePage = ImpromptuSpeechStage.Start),
    );
  };

  const onPreviousQuestion = () => {
    if (currentNum > 0) {
      setCurrentNum(currentNum - 1);
    }
  };
  const onNextQuestion = () => {
    if (currentNum < questionNums - 1) {
      setCurrentNum(currentNum + 1);
    }
  };

  const onReport = () => {
    chatStore.updateCurrentSession(
      (session) =>
        (impromptuSpeechInput.ActivePage = ImpromptuSpeechStage.Report),
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button className={styles.navButton} onClick={onReturn}>
          {" "}
          ← Return
        </button>
        <ButtonGroup
          aria-label="radius button group"
          sx={{ "--ButtonGroup-radius": "40px" }}
        >
          <Button onClick={onPreviousQuestion}>{"<"}</Button>
          <Button>{`Question ${currentNum + 1} / ${questionNums}`}</Button>
          <Button onClick={onNextQuestion}>{">"}</Button>
        </ButtonGroup>

        <button className={styles.capsuleButton} onClick={onReport}>
          End & Report
        </button>
      </div>

      <BorderLine></BorderLine>

      <form onSubmit={(event) => event.preventDefault()}>
        <p className={styles.questionText}>
          {questionItems[currentNum].Question}
        </p>
        <div className={styles.timer}>
          {/* TODO: 为啥 questionItems[currentNum].SpeechTime 也会刷新? */}
          <span>{formatTime(speechTime)} / 2:00</span>
        </div>
        {recordingStatus === StageStatus.Start && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <IconButtonMui
              aria-label="play"
              onClick={() =>
                speechSynthesizer.startSynthesize(
                  questionItems[currentNum].Question,
                  session.mask.lang,
                )
              }
            >
              <PlayCircleIcon />
            </IconButtonMui>
            <IconButtonMui
              aria-label="record"
              color="primary"
              sx={{
                color: "green",
                fontSize: "40px",
              }}
              onClick={onRecord}
            >
              <MicIcon sx={{ fontSize: "inherit" }} />
            </IconButtonMui>
          </Stack>
        )}

        {recordingStatus === StageStatus.Recording && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <IconButtonMui
              aria-label="record"
              color="primary"
              sx={{
                color: "red",
                fontSize: "40px",
              }}
              onClick={onPause}
            >
              <MicIcon sx={{ fontSize: "inherit" }} />
            </IconButtonMui>
          </Stack>
        )}

        {recordingStatus === StageStatus.Paused && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <button className={styles.capsuleButton} onClick={onReset}>
              Reset
            </button>
            {/* TODO: 总是会丢掉当前最新的录音, 不知如何解决 */}
            {/* <button className={styles.capsuleButton} onClick={onPlay} type="button">
              Play
            </button> */}
            <button className={styles.capsuleButton} onClick={onRecord}>
              Resume
            </button>
            <button className={styles.capsuleButton} onClick={onStop}>
              Stop
            </button>
          </Stack>
        )}

        {recordingStatus === StageStatus.Stopped && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <IconButtonMui
              color="secondary"
              aria-label="score"
              sx={{
                backgroundColor: "lightblue", // 淡蓝色背景
                color: "white", // 图标颜色，这里选择了白色
                "&:hover": {
                  backgroundColor: "green", // 鼠标悬停时的背景色，这里选择了蓝色
                },
                borderRadius: "50%", // 圆形
                width: 40, // 宽度
                height: 40, // 高度
                padding: 0, // 如果需要，调整内边距
              }}
              onClick={onReset}
            >
              <Typography variant="subtitle1">Reset</Typography>
            </IconButtonMui>

            <IconButtonMui
              aria-label="record"
              color="primary"
              sx={{
                color: "green",
                fontSize: "40px",
              }}
              onClick={onRecord}
            >
              <MicIcon sx={{ fontSize: "inherit" }} />
            </IconButtonMui>

            <IconButtonMui
              color="secondary"
              aria-label="score"
              sx={{
                backgroundColor: "lightblue", // 淡蓝色背景
                color: "white", // 图标颜色，这里选择了白色
                "&:hover": {
                  backgroundColor: "green", // 鼠标悬停时的背景色，这里选择了蓝色
                },
                borderRadius: "50%", // 圆形
                width: 40, // 宽度
                height: 40, // 高度
                padding: 0, // 如果需要，调整内边距
              }}
              onClick={onPlay}
            >
              <Typography variant="subtitle1">Play</Typography>
            </IconButtonMui>
          </Stack>
        )}
      </form>

      <BorderLine></BorderLine>

      <Accordion sx={{ backgroundColor: "#f5f5f5", userSelect: "text" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Sample Speech</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ textAlign: "left" }}>
          <Markdown
            content={questionItems[currentNum].SampleSpeech}
            fontSize={config.fontSize}
            parentRef={scrollRef}
          />
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <IconButtonMui
              aria-label="play"
              onClick={() =>
                speechSynthesizer.startSynthesize(
                  questionItems[currentNum].SampleSpeech,
                  session.mask.lang,
                )
              }
            >
              <PlayCircleIcon />
            </IconButtonMui>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion
        sx={{
          backgroundColor: "#f5f5f5",
          userSelect: "text",
          marginTop: "5px",
        }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Evaluations</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={evaluationRole}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChangeEvaluationRole}
                  aria-label="lab API tabs example"
                >
                  {evaluationRoles.map((role, index) => (
                    <Tab
                      key={index}
                      label={role}
                      value={role}
                      sx={{ textTransform: "none" }}
                    />
                  ))}
                </TabList>
              </Box>
              {evaluationRoles.map((role, index) => (
                <TabPanel key={index} value={role}>
                  {role in questionItems[currentNum].Evaluations ? (
                    <Typography style={{ textAlign: "left" }}>
                      <ReactMarkdown>
                        {questionItems[currentNum].Evaluations[role]}
                      </ReactMarkdown>
                      <Stack
                        direction="row"
                        spacing={5}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <IconButtonMui
                          aria-label="play"
                          onClick={() =>
                            speechSynthesizer.startSynthesize(
                              questionItems[currentNum].Evaluations[role],
                              session.mask.lang,
                            )
                          }
                        >
                          <PlayCircleIcon />
                        </IconButtonMui>
                      </Stack>
                    </Typography>
                  ) : evaluating ? (
                    <CircularProgress />
                  ) : (
                    <Button onClick={(event) => onEvaluation(event)}>
                      Look Evaluation
                    </Button>
                  )}
                </TabPanel>
              ))}
            </TabContext>
          </Box>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

// Define a type for the props expected by the RehearsalReportCard component
type RehearsalReportCardProps = {
  title: string;
  children: React.ReactNode;
};

function RehearsalReportCard({ title, children }: RehearsalReportCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export function FreePersonalReport(props: {
  impromptuSpeechInput: ImpromptuSpeechInput;
}) {
  const questionItems = props.impromptuSpeechInput.QuestionItems;

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const formatXAxis = (tickItem: string, index: number) => {
    return `Q${index + 1}`;
  };

  const onReturn = () => {
    chatStore.updateCurrentSession(
      (session) =>
        (props.impromptuSpeechInput.ActivePage = ImpromptuSpeechStage.Question),
    );
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Impromptu Speech Report
      </Typography>

      {/* Summary Card */}
      <RehearsalReportCard title="Summary">
        <CardContent>
          <Typography variant="h5" component="div">
            Good job rehearsing! Keep up the hard work.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Typography variant="h6" color="text.primary">
              0:23
            </Typography>
            <Typography variant="h6" color="text.primary">
              5 / 5
            </Typography>
            <Typography variant="h6" color="text.primary">
              80
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="text.secondary">TotalTime</Typography>
            <Typography color="text.secondary">Questions</Typography>
            <Typography color="text.secondary">AverageScore</Typography>
          </Box>
        </CardContent>
      </RehearsalReportCard>

      {/* Bar Card */}
      <RehearsalReportCard title="Average">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            width={500}
            height={300}
            data={questionItems}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis tickFormatter={formatXAxis} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="SpeechTime"
              fill="#8884d8"
              name="SpeechTime"
            >
              <LabelList dataKey="SpeechTime" position="top" />
            </Bar>
            <Bar yAxisId="right" dataKey="Score" fill="#82ca9d" name="Score">
              <LabelList dataKey="Score" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </RehearsalReportCard>

      {/* Evaluation Card */}
      <RehearsalReportCard title="Evaluation">
        <Typography variant="body1">
          To sound more polished and confident, try to avoid using filler words.
          Pause or take a breath to relax. Some filler words to avoid are:
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          umm
        </Typography>
      </RehearsalReportCard>

      <Button variant="contained" sx={{ mt: 3 }} onClick={onReturn}>
        Rehearse Again
      </Button>
    </Box>
  );
}
