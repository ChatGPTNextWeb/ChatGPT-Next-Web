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

class ISpeechCopilotInput {
  activeStep: number = 0;
  topic: string = "";
  questions: number = 5;
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
  const [questions, setQuestions] = useState(session.inputCopilot?.questions);

  useEffect(() => {
    if (session.inputCopilot === undefined)
      chatStore.updateCurrentSession(
        (session) => (session.inputCopilot = new ISpeechCopilotInput()),
      );
  }, []);

  const doSubmit = () => {
    if (topic === "") {
      showToast(`topic is empty, please check`);
      return;
    }

    chatStore.updateCurrentSession(
      (session) => (
        (session.inputCopilot!.topic = topic),
        (session.inputCopilot!.questions = questions),
        (session.inputCopilot!.activeStep = 1)
      ),
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
        // onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {session.inputCopilot?.activeStep === 0 && (
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
                defaultValue={5}
                min={1}
                value={questions}
                onChange={(e) => setQuestions(parseInt(e.currentTarget.value))}
              ></input>
            </ListItem>
            <ListItem title="">
              <IconButton
                icon={<SendWhiteIcon />}
                text={"Submit"}
                className={styles_tm["chat-input-button-submit"]}
                onClick={doSubmit}
              />
            </ListItem>
          </List>
        )}

        {session.inputCopilot?.activeStep === 1 && (
          <ImpromptuSpeechQuestion></ImpromptuSpeechQuestion>
        )}
      </div>
    </div>
  );
}

const ImpromptuSpeechQuestion: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(120); // assuming the timer starts with 2 minutes
  const [userResponse, setUserResponse] = useState("");

  useEffect(() => {
    const timer =
      timeLeft > 0 && setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer as NodeJS.Timeout);
  }, [timeLeft]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Implement your submit logic here
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button className={styles.navButton}> ← Restart</button>
        <ButtonGroup
          aria-label="radius button group"
          sx={{ "--ButtonGroup-radius": "40px" }}
        >
          <Button>{"<"}</Button>
          <Button>Question 1 / 5</Button>
          <Button>{">"}</Button>
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
        <p className={styles.questionText}>
          Can you provide an example of a time when you had to prioritize
          features and tasks for product development based on business and
          customer impact?
        </p>
        <div className={styles.timer}>
          <span>
            Speech: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {formatTime(timeLeft)}{" "}
            / 2:00
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
            sx={{ color: green[500], fontSize: "40px" }}
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
