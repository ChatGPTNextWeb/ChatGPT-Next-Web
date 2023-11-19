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
import styles from "./impromptu-speech.module.scss";

import IconButtonMui from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Button from "@mui/joy/Button";
import ButtonGroup from "@mui/joy/ButtonGroup";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import MicIcon from "@mui/icons-material/Mic";
import SixtyFpsOutlinedIcon from "@mui/icons-material/SixtyFpsOutlined";
import { green } from "@mui/material/colors";

import { ImpromptuSpeechV5Collapse } from "./impromptu-v5-collapse";
import { speechRecognizer } from "../cognitive/speech-sdk";
import { red } from "@material-ui/core/colors";
import {
  ImpromptuSpeechPromptKeys,
  ImpromptuSpeechPrompts,
} from "./ISpeechRoles";

// TODO:
const ToastmastersDefaultLangugage = "en";

interface IChatAskResponse {
  Ask: string;
  Response: string;
}

class ISpeechCopilotInput {
  ActiveStep: number = 0;
  Topic: string = "";
  Questions: number = 5;
  MessagesDict: Record<string, IChatAskResponse> = {};
}

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
  const [topic, setTopic] = useState(session.inputCopilot?.topic);
  const [questionNums, setQuestionNums] = useState(
    session.inputCopilot?.questions,
  );
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (session.inputCopilot === undefined)
      chatStore.updateCurrentSession(
        (session) => (session.inputCopilot = new ISpeechCopilotInput()),
      );
  }, []);

  const doSubmit = async () => {
    if (topic === "" || questionNums === undefined) {
      showToast(`Topic or questions is empty, please check`);
      return;
    }
    setSubmitting(true);

    // reset status from 0
    chatStore.resetSession();

    let ask = ImpromptuSpeechPrompts.GetQuestionsPrompt(topic, questionNums);
    chatStore.onUserInput(ask, ImpromptuSpeechPromptKeys.Questions);
    await chatStore.getIsFinished();

    const response = session.messages[session.messages.length - 1].content;
    console.log("Questions: ", response);

    let stringArray: string[] = [];
    try {
      stringArray = JSON.parse(response);
    } catch (error) {
      showToast(`Questions are not correct format, please try again.`);
    }

    setQuestions(stringArray);
    chatStore.updateCurrentSession(
      (session) => (
        (session.inputCopilot!.Topic = topic),
        (session.inputCopilot!.QuestionNums = questionNums),
        (session.inputCopilot!.ActiveStep = 1),
        (session.inputCopilot!.MessagesDict[
          ImpromptuSpeechPromptKeys.Questions
        ] = { Ask: ask, Response: response })
      ),
    );

    setSubmitting(false);
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
        // onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {session.inputCopilot?.ActiveStep === 0 && (
          <List>
            <ListItem title="Topic">
              <textarea
                ref={inputRef}
                className={styles_chat["chat-input"]}
                onInput={(e) => setTopic(e.currentTarget.value)}
                value={topic}
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
                // defaultValue={session.inputCopilot?.QuestionNums}
                min={1}
                value={questionNums}
                onChange={(e) =>
                  setQuestionNums(parseInt(e.currentTarget.value))
                }
              ></input>
            </ListItem>

            {/* TODO: reenter */}
            {/* {session.inputCopilot?.activeStep === 0 && ( */}
            <ListItem title="">
              <IconButton
                icon={<SendWhiteIcon />}
                text={submitting ? "Submitting" : "Submit"}
                disabled={submitting}
                className={
                  submitting
                    ? styles_tm["chat-input-button-submitting"]
                    : styles_tm["chat-input-button-submit"]
                }
                onClick={doSubmit}
              />
            </ListItem>
            {/* )} */}
          </List>
        )}

        {session.inputCopilot?.ActiveStep === 1 && (
          <ImpromptuSpeechQuestion
            questions={questions}
            questionsNums={questionNums}
          ></ImpromptuSpeechQuestion>
        )}
      </div>
    </div>
  );
}

const ImpromptuSpeechQuestion = (props: {
  questions: string[];
  questionsNums: number;
}) => {
  const [timeLeft, setTimeLeft] = useState(120); // assuming the timer starts with 2 minutes
  const [userResponse, setUserResponse] = useState("");
  const [recording, setRecording] = useState(false);
  const [speechTime, setSpeechTime] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [currentNum, setCurrentNum] = useState(0);

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  useEffect(() => {
    const timer =
      timeLeft > 0 && setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer as NodeJS.Timeout);
  }, [timeLeft]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recording) {
      intervalId = setInterval(() => {
        setSpeechTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [recording]);

  const onRecord = () => {
    if (!recording) {
      speechRecognizer.startRecording(
        appendUserInput,
        ToastmastersDefaultLangugage,
      );
      setRecording(true);
    } else {
      speechRecognizer.stopRecording();
      setRecording(false);
    }
  };

  const appendUserInput = (newState: string): void => {
    // 每次按下button时 换行显示
    if (userInput === "") {
      setUserInput(newState);
    } else {
      setUserInput(userInput + "\n" + newState);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement your submit logic here
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onReturn = () => {
    chatStore.updateCurrentSession(
      (session) => (session.inputCopilot!.ActiveStep = 0),
    );
  };

  const onPreviousQuestion = () => {
    if (currentNum > 0) setCurrentNum(currentNum - 1);
  };
  const onNextQuestion = () => {
    if (currentNum < props.questionsNums - 1) setCurrentNum(currentNum + 1);
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
          <Button>{`Question ${currentNum + 1} / ${
            props.questionsNums
          }`}</Button>
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

      <form onSubmit={handleSubmit}>
        <p className={styles.questionText}>{props.questions[currentNum]}</p>
        <div className={styles.timer}>
          <span>
            Speech: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{" "}
            {formatTime(speechTime)} / 2:00
          </span>
        </div>
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
              color: recording === true ? "red" : "green",
              fontSize: "40px",
            }}
            onClick={onRecord}
          >
            <MicIcon sx={{ fontSize: "inherit" }} />
          </IconButtonMui>
          <IconButtonMui color="secondary" aria-label="score">
            <SixtyFpsOutlinedIcon />
          </IconButtonMui>
        </Stack>
      </form>

      <ImpromptuSpeechV5Collapse></ImpromptuSpeechV5Collapse>
    </div>
  );
};
