import React, { useState, useRef, useEffect } from "react";

import { useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import { List, showToast } from "../components/ui-lib";

import {
  ToastmastersIEvaluatorGuidance as ToastmastersRoleGuidance,
  ToastmastersIEvaluator as ToastmastersRoleOptions,
  ToastmastersRolePrompt,
  InputSubmitStatus,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatInputSubmit,
  ChatResponse,
  useScrollToBottom,
} from "./chat-common";

export function Chat() {
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const [toastmastersEvaluators, setToastmastersEvaluators] = useState<
    ToastmastersRolePrompt[]
  >([]);

  // 进来时, 读取上次的输入
  useEffect(() => {
    var roles = session.inputs.roles?.map(
      (index: number) => ToastmastersRoleOptions[index],
    );
    setToastmastersEvaluators(roles);
  }, [session]);

  const checkInput = (): InputSubmitStatus => {
    const question = session.inputs.input.text;
    const speech = session.inputs.input2.text;

    if (question.trim() === "") {
      showToast("Question can not be empty");
      return new InputSubmitStatus(false, "");
    }

    if (speech === "") {
      showToast("Speech can not be empty");
      return new InputSubmitStatus(false, "");
    }

    // Add a return statement for the case where the input is valid
    var guidance = ToastmastersRoleGuidance(question, speech);
    return new InputSubmitStatus(true, guidance);
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle></ChatTitle>

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
          <ChatInput title="Topic" inputStore={session.inputs.input} />
          <ChatInput
            title="Prepared Speech"
            inputStore={session.inputs.input2}
          />

          <ChatInputSubmit
            roleOptions={ToastmastersRoleOptions}
            selectedValues={toastmastersEvaluators}
            updateParent={setToastmastersEvaluators}
            checkInput={checkInput}
          />

          <ChatResponse
            scrollRef={scrollRef}
            toastmastersRolePrompts={toastmastersEvaluators}
          />
        </List>
      </div>
    </div>
  );
}
