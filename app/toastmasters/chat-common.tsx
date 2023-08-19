import { useDebouncedCallback } from "use-debounce";
import React, { useState, useRef, useEffect, useCallback } from "react";

import LoadingIcon from "../icons/three-dots.svg";
import MicphoneIcon from "../icons/Micphone.svg";

import { InputStore, useAppConfig } from "../store";

import { autoGrowTextArea } from "../utils";
import dynamic from "next/dynamic";

import { IconButton } from "../components/button";
import styles from "../components/chat.module.scss";

import { speechRecognizer } from "../cognitive/speech-sdk";

const ToastmastersDefaultLangugage = "en";

export const ChatInput = (props: { title: string; inputStore: InputStore }) => {
  const config = useAppConfig();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [recording, setRecording] = useState(false);

  /*
  when page is mounted, show last userInput
  when userInput is changed, show userInput
  when Send button is clicked, show session.messages[session.messages.length-1].content
  */
  const [userInput, setUserInput] = useState(props.inputStore.text);
  const [time, setTime] = useState(props.inputStore.time);

  // 计时器
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (recording) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      // save to store
      props.inputStore.time = time;
      clearInterval(intervalId);
    };
  }, [recording]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

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
    // save to store
    props.inputStore.text = userInput;

    // set the focus to the input at the end of textarea
    inputRef.current?.focus();
  }, [userInput]); // should not depend props in case auto focus expception

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

  return (
    <div className={styles["chat-input-panel-noborder"]}>
      <div className={styles["chat-input-panel-title"]}>{props.title}</div>
      <div className={styles["chat-input-panel-inner"]}>
        <textarea
          ref={inputRef}
          className={styles["chat-input"]}
          placeholder={"Enter To wrap"}
          onInput={(e) => setUserInput(e.currentTarget.value)}
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
        <div className={styles["chat-input-words"]}>
          {userInput.length > 0 ? userInput.split(/\s+/).length : 0} words,{" "}
          {formatTime(time)}
        </div>
      </div>
    </div>
  );
};

export const ChatAction = (props: {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  return (
    <div
      className={`${styles["chat-input-action"]} clickable`}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      <div className={styles["text"]} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
};

export const Markdown = dynamic(
  async () => (await import("../components/markdown")).Markdown,
  {
    loading: () => <LoadingIcon />,
  },
);

export function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = useCallback(() => {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => dom.scrollTo(0, dom.scrollHeight));
    }
  }, []);

  // auto scroll
  useEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}
