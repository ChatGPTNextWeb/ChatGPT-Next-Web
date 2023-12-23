import React, { useState, useRef, useEffect, use } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useAppConfig, useChatStore } from "../store";

import { List, ListItem, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import { Markdown } from "../components/exporter";
import { useScrollToBottom } from "../components/chat";
import SendWhiteIcon from "../icons/send-white.svg";

import { ChatTitle, BorderLine } from "./chat-common";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";
import styles from "./ISpeech.module.scss";

import Stack from "@mui/material/Stack";
import {
  IQuestionItem,
  ESpeechModes,
  ImpromptuSpeechPrompts,
  ESpeechStage,
  ImpromptuSpeechInput,
} from "./ISpeechRoles";
import { LinearProgressWithLabel } from "./ISpeech-Common";
import {
  FreePersonalQuestionPage,
  FreePersonalReport,
} from "./ISpeech-FreePersonal";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const getInputsString = (): string => {
    return "";
  };

  useEffect(() => {
    // 在组件加载时初始化 inputCopilot
    if (!session.inputCopilot) {
      chatStore.updateCurrentSession((session) => {
        session.inputCopilot = new ImpromptuSpeechInput();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 空依赖数组表示这个 effect 只在组件挂载时运行一次

  // 检查 inputCopilot 是否已初始化
  if (!session || !session.inputCopilot) {
    return <div>Loading...</div>; // 或其他的加载指示
  }

  return (
    <div className={styles_chat.chat} key={session.id}>
      <ChatTitle getInputsString={getInputsString}></ChatTitle>
      <div className={styles_chat["chat-body"]}>
        {session.inputCopilot.ActivePage === ESpeechStage.Start && (
          <ImpromptuSpeechSetting></ImpromptuSpeechSetting>
        )}

        {session.inputCopilot.ActivePage === ESpeechStage.Question && (
          <FreePersonalQuestionPage
            impromptuSpeechInput={session.inputCopilot}
          ></FreePersonalQuestionPage>
          // session.inputCopilot.Interaction === ImpromptuSpeechModes.Free ?
          // <FreePersonalQuestionPage
          //   scrollRef={scrollRef}
          //   impromptuSpeechInput={session.inputCopilot}
          // ></FreePersonalQuestionPage> :
          // <InterviewPersonalQuestionPage
          //   scrollRef={scrollRef}
          //   impromptuSpeechInput={session.inputCopilot}
          // ></InterviewPersonalQuestionPage>
        )}

        {session.inputCopilot.ActivePage === ESpeechStage.Report && (
          <FreePersonalReport
            impromptuSpeechInput={session.inputCopilot}
          ></FreePersonalReport>
        )}
      </div>
    </div>
  );
}

function ImpromptuSpeechSetting() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [topic, setTopic] = useState(session.inputCopilot.Topic);
  const [questionNums, setQuestionNums] = useState(
    session.inputCopilot.QuestionNums,
  );
  const [mode, setMode] = useState(session.inputCopilot.Mode);

  // TODO: save selected job
  const config = useAppConfig();
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const onSubmit = async () => {
    if (topic === "") {
      showToast(`Topic is empty, please check`);
      return;
    }
    if (questionNums <= 0) {
      showToast(`questions <= 0, please check`);
      return;
    }

    session.inputCopilot.Topic = topic;
    session.inputCopilot.QuestionNums = questionNums;
    session.inputCopilot.Mode = mode;

    setSubmitting(true);
    setSubmitProgress(0);

    const progressStep = Math.floor(
      100 / (1 + session.inputCopilot.QuestionNums),
    );

    // reset status from 0
    chatStore.resetSession();

    let ask = ImpromptuSpeechPrompts.GetQuestionsPrompt(
      session.inputCopilot.Topic,
      session.inputCopilot.QuestionNums,
    );
    chatStore.onUserInput(ask);
    await chatStore.getIsFinished();
    setSubmitProgress(progressStep);

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
      let question = stringArray[i];
      ask = ImpromptuSpeechPrompts.GetSampleSpeechPrompt(i, question);
      chatStore.onUserInput(ask);
      await chatStore.getIsFinished();

      response = session.messages[session.messages.length - 1].content;
      let questionItem = new IQuestionItem();
      questionItem.Speaker = "Speaker" + (i + 1).toString();
      questionItem.Question = question;
      questionItem.SampleSpeech = response;
      session.inputCopilot.QuestionItems.push(questionItem);

      setSubmitProgress(progressStep * (i + 2));
    }

    // reset so not effect sequential answer
    // but keep questions so that it has context
    chatStore.resetSessionFromIndex(2);

    chatStore.updateCurrentSession(
      (session) => (
        (session.inputCopilot.ActivePage = ESpeechStage.Question),
        (session.inputCopilot.HasQuestions = true),
        (session.inputCopilot.StartTime = new Date().getTime())
      ),
    );

    // console.log("session.inputCopilot=", session.inputCopilot);
    setSubmitting(false);
  };

  const onContinue = async () => {
    chatStore.updateCurrentSession(
      (session) => (session.inputCopilot.ActivePage = ESpeechStage.Question),
    );
  };

  return (
    <List>
      <ListItem title="Topic">
        <textarea
          ref={inputRef}
          className={styles_chat["chat-input"]}
          onInput={(e) => {
            setTopic(e.currentTarget.value);
          }}
          defaultValue={topic}
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
          defaultValue={questionNums}
          onChange={(e) => {
            setQuestionNums(parseInt(e.currentTarget.value));
          }}
        ></input>
      </ListItem>

      {/* TODO: further dev */}
      <ListItem title="Mode">
        <FormControl>
          <RadioGroup
            row
            name="controlled-radio-buttons-group"
            defaultValue={mode}
            onChange={(e) => {
              setMode(e.currentTarget.value);
            }}
          >
            <FormControlLabel
              value={ESpeechModes.Personal}
              control={<Radio />}
              label={ESpeechModes.Personal}
            />
            <FormControlLabel
              value={ESpeechModes.Hosting}
              control={<Radio />}
              label={ESpeechModes.Hosting}
            />
          </RadioGroup>
        </FormControl>
      </ListItem>

      {submitting ? (
        <div>
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
              text="Submitting"
              disabled={true}
              className={styles_tm["chat-input-button-submitting"]}
              onClick={onSubmit}
            />
          </Stack>
          <LinearProgressWithLabel value={submitProgress} />
        </div>
      ) : (
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
            text="Submit"
            disabled={submitting}
            className={styles_tm["chat-input-button-submit"]}
            onClick={onSubmit}
          />
          {session.inputCopilot?.HasQuestions && (
            <button className={styles.capsuleButton} onClick={onContinue}>
              Continue Last
            </button>
          )}
        </Stack>
      )}
    </List>
  );
}
