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

  const [speakerInputsString, setSpeakerInputsString] = useState("");

  useEffect(() => {
    // inputTable
    const speakerInputs = session.input.datas?.map((row) => ({
      Question: row.question.text,
      Speech: row.speech.text,
    }));
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    setSpeakerInputsString(speakerInputsString);
  }, [session.input.datas]);

  const checkInput = (): InputSubmitStatus => {
    if (session.input.datas.length <= 0) {
      showToast(`Input Table is empty, please check`);
      return new InputSubmitStatus(false, "");
    }

    const inputRow = session.input.datas[0];

    const question = inputRow.question.text.trim();
    const speech = inputRow.speech.text.trim();
    if (question === "" || speech === "") {
      showToast("Question or Speech is empty, please check");
      return new InputSubmitStatus(false, "");
    }

    const speakerInputs = {
      Question: question,
      Speech: speech,
    };
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);
    var guidance = ToastmastersRoleGuidance(speakerInputsString);
    return new InputSubmitStatus(true, guidance);
  };

  return (
    <div className={styles.chat} key={session.id}>
      <ChatTitle speakerInputsString={speakerInputsString}></ChatTitle>

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
              session.input.datas.length > 0
                ? session.input.datas[0].question
                : new InputStore()
            }
          />
          <ChatInput
            title="Speech"
            inputStore={
              session.input.datas.length > 0
                ? session.input.datas[0].speech
                : new InputStore()
            }
          />

          <ChatInputSubmitV2
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
