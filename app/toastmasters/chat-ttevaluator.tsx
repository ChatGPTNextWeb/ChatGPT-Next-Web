import React, { useState, useRef } from "react";

import { useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import { List, showToast } from "../components/ui-lib";

import {
  ToastmastersTTEvaluatorGuidance as ToastmastersRoleGuidance,
  ToastmastersTTEvaluatorRecord as ToastmastersRecord,
  InputSubmitStatus,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatResponse,
  ChatSubmitCheckbox,
} from "./chat-common";
import { SpeechAvatarVideoShow } from "../cognitive/speech-avatar";
import { useScrollToBottom } from "../components/chat";

export function Chat() {
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const checkInput = (): InputSubmitStatus => {
    const inputRow = session.input.data;
    const question = inputRow.question.text.trim();
    const speech = inputRow.speech.text.trim();
    if (question === "" || speech === "") {
      showToast("Question or Speech is empty, please check");
      return new InputSubmitStatus(false, "");
    }
    const guidance = ToastmastersRoleGuidance(getInputsString());
    return new InputSubmitStatus(true, guidance);
  };

  const getInputsString = (): string => {
    const inputRow = session.input.data;
    const speakerInputs = {
      Question: inputRow.question.text.trim(),
      Speech: inputRow.speech.text.trim(),
    };
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    return speakerInputsString;
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
          <ChatInput
            title="Question"
            inputStore={session.input.data.question}
          />
          <ChatInput title="Speech" inputStore={session.input.data.speech} />

          <ChatSubmitCheckbox
            toastmastersRecord={ToastmastersRecord}
            checkInput={checkInput}
          />

          <ChatResponse
            scrollRef={scrollRef}
            toastmastersRecord={ToastmastersRecord}
          />

          <SpeechAvatarVideoShow outputAvatar={session.output.avatar} />
        </List>
      </div>
    </div>
  );
}
