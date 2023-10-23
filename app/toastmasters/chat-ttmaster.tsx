import React, { useState, useRef, useEffect } from "react";

import { useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import { List, showToast } from "../components/ui-lib";

import {
  ToastmastersTTMasterGuidance as ToastmastersRoleGuidance,
  ToastmastersTTMasterRecord as ToastmastersRecord,
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
    const topic = session.input.data.question.text.trim();
    if (topic === "") {
      showToast("Topic can not be empty");
      return new InputSubmitStatus(false, "");
    }

    // Add a return statement for the case where the input is valid
    const guidance = ToastmastersRoleGuidance(topic);
    return new InputSubmitStatus(true, guidance);
  };

  const getInputsString = (): string => {
    const topic = session.input.data.question.text.trim();
    return topic;
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
          <ChatInput title="Topic" inputStore={session.input.data.question} />

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
