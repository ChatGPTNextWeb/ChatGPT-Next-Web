import React, { useState, useRef, useEffect, use } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useAppConfig, useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";
import { List, ListItem, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import SendWhiteIcon from "../icons/send-white.svg";

import { ChatTitle, BorderLine } from "./chat-common";

import { useScrollToBottom } from "../components/chat";
import styles from "./ISpeech.module.scss";

import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tabs from "@mui/material/Tabs";
// import Tab from '@mui/material/Tab';
import PhoneIcon from "@mui/icons-material/Phone";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import { speechRecognizer } from "../cognitive/speech-sdk";

import {
  IQuestionItem,
  ImpromptuSpeechInput,
  ImpromptuSpeechPrompts,
  ImpromptuSpeechRoles,
} from "./ISpeechRoles";
import ReactMarkdown from "react-markdown";

// TODO:
const ToastmastersDefaultLangugage = "en";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 设置自动滑动窗口
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  // TODO: save selected job
  const config = useAppConfig();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (
      session.inputCopilot.Topic === "" ||
      session.inputCopilot.QuestionNums <= 0
    ) {
      showToast(`Topic or questions is empty, please check`);
      return;
    }
    setSubmitting(true);

    // reset status from 0
    chatStore.resetSession();

    let ask = ImpromptuSpeechPrompts.GetQuestionsPrompt(
      session.inputCopilot.Topic,
      session.inputCopilot.QuestionNums,
    );
    chatStore.onUserInput(ask);
    await chatStore.getIsFinished();

    let response = session.messages[session.messages.length - 1].content;
    console.log("Questions: ", response);

    let stringArray: string[] = [];
    try {
      stringArray = JSON.parse(response);
    } catch (error) {
      showToast(`Questions are not correct format, please try again.`);
      return;
    }

    session.inputCopilot.QuestionItems = [];
    for (let i = 0; i < stringArray.length; i++) {
      // reset status from 0
      chatStore.resetSession();

      let question = stringArray[i];
      ask = ImpromptuSpeechPrompts.GetSampleSpeechPrompt(i, question);
      chatStore.onUserInput(ask);
      await chatStore.getIsFinished();

      response = session.messages[session.messages.length - 1].content;
      let questionItem = new IQuestionItem();
      questionItem.Question = question;
      questionItem.SampleSpeech = response;
      session.inputCopilot.QuestionItems.push(questionItem);
    }

    chatStore.updateCurrentSession(
      (session) => (
        (session.inputCopilot.ActiveStep = 1),
        (session.inputCopilot.HasQuestions = true)
      ),
    );

    console.log("session.inputCopilot=", session.inputCopilot);
    setSubmitting(false);
  };

  const onContinue = async () => {
    chatStore.updateCurrentSession(
      (session) => (session.inputCopilot.ActiveStep = 1),
    );
  };

  const getInputsString = (): string => {
    return "";
  };

  return (
    <div className={styles_chat.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>
      <div
        className={styles_chat["chat-body"]}
        ref={scrollRef}
        onMouseDown={() => inputRef.current?.blur()}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {session.inputCopilot.ActiveStep === 0 && (
          <List>
            <ListItem title="Topic">
              <textarea
                ref={inputRef}
                className={styles_chat["chat-input"]}
                onInput={(e) => {
                  session.inputCopilot.Topic = e.currentTarget.value;
                }}
                defaultValue={session.inputCopilot.Topic}
                rows={1}
                style={{
                  fontSize: config.fontSize,
                  minHeight: "30px",
                  marginLeft: "10px",
                }}
              />
            </ListItem>
            <ListItem title={"Questions"}>
              <input
                type="number"
                min={1}
                defaultValue={session.inputCopilot.QuestionNums}
                onChange={(e) => {
                  session.inputCopilot.QuestionNums = parseInt(
                    e.currentTarget.value,
                  );
                }}
              ></input>
            </ListItem>

            <Stack
              direction="row"
              spacing={10}
              justifyContent="center"
              alignItems="center"
              sx={{
                marginBottom: "20px",
                marginTop: "20px",
              }}
            >
              <IconButton
                icon={<SendWhiteIcon />}
                text={submitting ? "Submitting" : "Submit"}
                disabled={submitting}
                className={
                  submitting
                    ? styles_tm["chat-input-button-submitting"]
                    : styles_tm["chat-input-button-submit"]
                }
                onClick={onSubmit}
              />

              {session.inputCopilot?.HasQuestions && (
                <button className={styles.capsuleButton} onClick={onContinue}>
                  Continue Last
                </button>
              )}
            </Stack>
          </List>
        )}

        {session.inputCopilot.ActiveStep > 0 && (
          <ImpromptuSpeechQuestion
            activeStep={session.inputCopilot.ActiveStep}
            questionItems={session.inputCopilot.QuestionItems}
          ></ImpromptuSpeechQuestion>
        )}
      </div>
    </div>
  );
}

const ImpromptuSpeechQuestion = (props: {
  activeStep: number;
  questionItems: IQuestionItem[];
}) => {
  let { activeStep, questionItems } = props;
  const questionNums = questionItems.length;

  // 定义状态枚举
  enum StageStatus {
    Start = "",
    Recording = "Recording",
    Pausing = "Pausing",
    Scoring = "Scoring",
  }

  // 这两个状态就不保存了
  const [recording, setRecording] = useState(false);
  const [currentStage, setCurrentStage] = useState(StageStatus.Start);
  const [evaluationRole, setEvaluationRole] = React.useState<string>(
    ImpromptuSpeechRoles.Feedback,
  );

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  // local state used for reder page
  const [currentNum, setCurrentNum] = useState(
    session.inputCopilot.ActiveStep - 1,
  );

  // 需要实时刷新页面的, 就用useState, 否则直接用内部状态
  const [speechTime, setSpeechTime] = useState(
    questionItems[currentNum].SpeechTime,
  );

  // 当currentNum变化时, 更新初始值
  useEffect(() => {
    setSpeechTime(questionItems[currentNum].SpeechTime);
    setCurrentStage(StageStatus.Start);
  }, [StageStatus.Start, currentNum, questionItems]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recording) {
      intervalId = setInterval(() => {
        setSpeechTime((prevTime) => prevTime + 1); // 用于刷新页面
        questionItems[currentNum].SpeechTime = speechTime; // 用于保存状态
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [currentNum, questionItems, recording, speechTime]);

  const appendUserInput = (newState: string): void => {
    // 每次按下button时 换行显示
    if (
      questionItems[currentNum].Speech === "" ||
      questionItems[currentNum].Speech === undefined
    ) {
      questionItems[currentNum].Speech = newState;
    } else {
      questionItems[currentNum].Speech += "\n" + newState;
    }
    console.log("newState: ", newState);
  };

  const onRecord = () => {
    if (!recording) {
      speechRecognizer.startRecording(
        appendUserInput,
        ToastmastersDefaultLangugage,
      );
      setRecording(true);
      setCurrentStage(StageStatus.Recording);
    }
  };

  const onPause = () => {
    if (recording) {
      speechRecognizer.stopRecording();
      setRecording(false);
      setCurrentStage(StageStatus.Pausing);
    }
  };

  const onReset = () => {
    // 清存储
    questionItems[currentNum].ResetCurrent();
    // 改状态
    setSpeechTime(0);
    setCurrentStage(StageStatus.Start);
  };

  const onScore = (event: { preventDefault: () => void }) => {
    // TODO:
    questionItems[currentNum].Speech = "Yes, I think it is good";

    if (
      questionItems[currentNum].Speech === "" ||
      questionItems[currentNum].Speech === undefined
    ) {
      event.preventDefault();
      showToast("Speech is empty");
      return;
    }

    // reset status from 0
    chatStore.resetSession();

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

    setCurrentStage(StageStatus.Scoring);
  };

  const evaluationRoles = ImpromptuSpeechPrompts.GetEvaluationRoles();

  const onEvaluation = async (event: { preventDefault: () => void }) => {
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

    // reset status from 0
    chatStore.resetSession();

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
      (session) => (session.inputCopilot.ActiveStep = 0),
    );
  };

  const onPreviousQuestion = () => {
    if (currentNum > 0) {
      setCurrentNum(currentNum - 1);
      session.inputCopilot.ActiveStep -= 1;
    }
  };
  const onNextQuestion = () => {
    if (currentNum < questionNums - 1) {
      setCurrentNum(currentNum + 1);
      session.inputCopilot.ActiveStep += 1;
    }
  };

  const onSampleSpeechExpand = async () => {
    console.log("onSampleSpeechExpand-0");
    if (questionItems[currentNum].SampleSpeech == undefined) {
      console.log("onSampleSpeechExpand-1");

      let ask = ImpromptuSpeechPrompts.GetSampleSpeechPrompt(
        currentNum,
        questionItems[currentNum].Question,
      );
      chatStore.onUserInput(ask);
      await chatStore.getIsFinished();

      chatStore.updateCurrentSession(
        (session) =>
          (questionItems[currentNum].SampleSpeech =
            session.messages[session.messages.length - 1].content),
      );
    }
    console.log("onSampleSpeechExpand-2");
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

        <button
          className={styles.capsuleButton}
          // onClick={onClick}
        >
          End & Review
        </button>
      </div>

      <BorderLine></BorderLine>

      <form>
        <p className={styles.questionText}>
          {questionItems[currentNum].Question}
        </p>
        <div className={styles.timer}>
          {/* TODO: 为啥 questionItems[currentNum].SpeechTime 也会刷新? */}
          <span>{formatTime(speechTime)} / 2:00</span>
        </div>
        {currentStage === StageStatus.Start && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <IconButtonMui aria-label="play">
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

        {currentStage === StageStatus.Recording && (
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

        {currentStage === StageStatus.Pausing && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <button className={styles.capsuleButton} onClick={onReset}>
              Reset
            </button>

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

            <button
              className={styles.capsuleButton}
              onClick={(event) => onScore(event)}
            >
              Score
            </button>
          </Stack>
        )}

        {currentStage === StageStatus.Scoring && (
          <Stack
            direction="row"
            spacing={5}
            justifyContent="center"
            alignItems="center"
          >
            <button className={styles.capsuleButton} onClick={onReset}>
              Reset
            </button>

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
            >
              <Typography variant="subtitle1">
                {questionItems[currentNum].Score}
              </Typography>
            </IconButtonMui>
          </Stack>
        )}
      </form>

      <BorderLine></BorderLine>

      <Accordion sx={{ backgroundColor: "#f5f5f5" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          // onClick={onSampleSpeechExpand}
        >
          <Typography>Sample Speech</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <ReactMarkdown>
              {questionItems[currentNum].SampleSpeech}
            </ReactMarkdown>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ backgroundColor: "#f5f5f5", marginTop: "5px" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          // onClick={onSampleSpeechExpand}
        >
          <Typography>Evaluation</Typography>
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
                    <Typography>
                      <ReactMarkdown>
                        {questionItems[currentNum].Evaluations[role]}
                      </ReactMarkdown>
                    </Typography>
                  ) : (
                    <Button onClick={(event) => onEvaluation(event)}>
                      Start Evaluation
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
