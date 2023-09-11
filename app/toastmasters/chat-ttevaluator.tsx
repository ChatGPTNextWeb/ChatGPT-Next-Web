import React, { useState, useRef, useEffect } from "react";

import { InputStore, useChatStore } from "../store";

import styles from "../components/chat.module.scss";
import { List, showToast } from "../components/ui-lib";

import {
  ToastmastersTTEvaluatorGuidance as ToastmastersRoleGuidance,
  ToastmastersTTEvaluatorRecord as ToastmastersRecord,
  ToastmastersRolePrompt,
  InputSubmitStatus,
} from "./roles";
import {
  ChatTitle,
  ChatInput,
  ChatInputSubmitV2,
  ChatResponse,
  useScrollToBottom,
} from "./chat-common";
import { SpeechAvatarVideoShow } from "../cognitive/speech-avatar-component";

export function Chat() {
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(true);

  const [toastmastersRolePrompts, setToastmastersRolePrompts] = useState<
    ToastmastersRolePrompt[]
  >([]);

  // // 进来时, 读取上次的输入
  // useEffect(() => {
  //   var roles = session.inputs.roles?.map(
  //     (index: number) => ToastmastersRoleOptions[index],
  //   );
  //   setToastmastersEvaluators(roles);
  // }, [session]);

  useEffect(() => {
    // 将选择的role, 合并为一个数组
    var _rolePrompts: ToastmastersRolePrompt[] = [];
    session.inputRoles?.forEach((roleName: any) => {
      _rolePrompts = _rolePrompts.concat(ToastmastersRecord[roleName]);
    });
    setToastmastersRolePrompts(_rolePrompts);
  }, [session.inputRoles]);

  const checkInput = (): InputSubmitStatus => {
    if (session.inputTable.length <= 0) {
      showToast("inputTable.length <= 0");
      return new InputSubmitStatus(false, "");
    }

    const question = session.inputTable[0].question.text;
    const speech = session.inputTable[0].speech.text;
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
          <ChatInput
            title="Question"
            inputStore={
              session.inputTable.length > 0
                ? session.inputTable[0].question
                : new InputStore()
            }
          />
          <ChatInput
            title="Speech"
            inputStore={
              session.inputTable.length > 0
                ? session.inputTable[0].speech
                : new InputStore()
            }
          />

          <ChatInputSubmitV2
            toastmastersRecord={ToastmastersRecord}
            checkInput={checkInput}
          />

          <ChatResponse
            scrollRef={scrollRef}
            toastmastersRolePrompts={toastmastersRolePrompts}
          />

          <SpeechAvatarVideoShow outputAvatar={session.outputAvatar} />
        </List>
      </div>
    </div>
  );
}
