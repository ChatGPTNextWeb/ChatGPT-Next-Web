import React, { useState, useRef, useEffect, use } from "react";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useAppConfig, useChatStore } from "../store";

import styles_chat from "../components/chat.module.scss";
import styles_tm from "../toastmasters/toastmasters.module.scss";
import { List, ListItem, showPrompt, showToast } from "../components/ui-lib";
import { IconButton } from "../components/button";
import { Markdown } from "../components/exporter";
import { useScrollToBottom } from "../components/chat";
import SendWhiteIcon from "../icons/send-white.svg";

import { ChatTitle, BorderLine } from "./chat-common";

import styles from "./ISpeech.module.scss";

import Stack from "@mui/material/Stack";
import {
  IQuestionItem,
  ImpromptuSpeechPrompts,
  ImpromptuSpeechStage,
} from "./ISpeechRoles";
import { LinearProgressWithLabel } from "./ISpeech-Common";
import {
  FreePersonalQuestionPage,
  FreePersonalReport,
} from "./ISpeech-FreePersonal";

export function Chat() {
  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 设置自动滑动窗口
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();

  // TODO: save selected job
  const config = useAppConfig();

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
        {session.inputCopilot.ActivePage === ImpromptuSpeechStage.Start && (
          <ImpromptuSpeechSetting></ImpromptuSpeechSetting>
        )}

        {session.inputCopilot.ActivePage === ImpromptuSpeechStage.Question && (
          <FreePersonalQuestionPage
            scrollRef={scrollRef}
            impromptuSpeechInput={session.inputCopilot}
          ></FreePersonalQuestionPage>
        )}

        {session.inputCopilot.ActivePage === ImpromptuSpeechStage.Report && (
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

  // TODO: save selected job
  const config = useAppConfig();
  const [submitting, setSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);

  const onSubmit = async () => {
    if (
      session.inputCopilot.Topic === "" ||
      session.inputCopilot.QuestionNums <= 0
    ) {
      showToast(`Topic or questions is empty, please check`);
      return;
    }
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
        (session.inputCopilot.ActivePage = ImpromptuSpeechStage.Question),
        (session.inputCopilot.HasQuestions = true)
      ),
    );

    console.log("session.inputCopilot=", session.inputCopilot);
    setSubmitting(false);
  };

  const onContinue = async () => {
    chatStore.updateCurrentSession(
      (session) =>
        (session.inputCopilot.ActivePage = ImpromptuSpeechStage.Question),
    );
  };

  return (
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
            session.inputCopilot.QuestionNums = parseInt(e.currentTarget.value);
          }}
        ></input>
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
