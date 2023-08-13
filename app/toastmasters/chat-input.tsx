import { useDebouncedCallback } from "use-debounce";
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import MicphoneIcon from "../icons/Micphone.svg";

import {
  ChatMessage,
  SubmitKey,
  useChatStore,
  BOT_HELLO,
  createMessage,
  useAccessStore,
  Theme,
  useAppConfig,
  DEFAULT_TOPIC,
  ALL_MODELS,
} from "../store";

import {
  copyToClipboard,
  downloadAs,
  selectOrCopy,
  autoGrowTextArea,
  useMobileScreen,
} from "../utils";

import { IconButton } from "../components/button";
import styles from "../components/chat.module.scss";

import speechSdk, { speechRecognizer } from "../cognitive/speech-sdk";

export const ChatInput = (props: {
  title: string;
  defaultInput: string;
  onReturnValue: (arg0: string) => void;
}) => {
  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState(props.defaultInput ?? "");
  const [recording, setRecording] = useState(false);

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(
        10,
        // Math.max(2 + Number(!isMobileScreen), rows),
        rows,
      );
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // set parent value
  useEffect(() => {
    props.onReturnValue(userInput);
    // set the focus to the input at the end of textarea
    inputRef.current?.focus();
  }, [userInput]); // should not depend props in case auto focus expception

  const onRecord = () => {
    if (!recording) {
      speechRecognizer.startRecording(appendUserInput);
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

  const onInput = (text: string) => {
    console.log("onInput:", text);
    setUserInput(text);

    const n = text.trim().length;

    // // clear search results
    // if (n === 0) {
    //   setPromptHints([]);
    // }
  };

  const promptInput = () => {
    var inputHints = "Enter To wrap";
    return inputHints;
  };

  return (
    <div className={styles["chat-input-panel-noborder"]}>
      <div className={styles["chat-input-panel-title"]}>{props.title}</div>
      <div className={styles["chat-input-panel-inner"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-input"]}
          placeholder={promptInput()}
          // onInput={(e) => onInput(e.currentTarget.value)}
          onChange={(e) => onInput(e.currentTarget.value)}
          value={userInput}
          // onFocus={() => setAutoScroll(true)}
          // onBlur={() => setAutoScroll(false)}
          rows={inputRows}
          // autoFocus={autoFocus}
          style={{
            fontSize: config.fontSize,
          }}
        />
        <IconButton
          icon={<MicphoneIcon />}
          text={recording ? "Recording" : "Record"}
          bordered
          className={
            recording
              ? styles["chat-input-send-recording"]
              : styles["chat-input-send-record"]
          }
          onClick={onRecord}
        />
      </div>
    </div>
  );
};
