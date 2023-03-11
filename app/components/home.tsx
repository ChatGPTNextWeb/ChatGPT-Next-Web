"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import ReactMarkdown from "react-markdown";

import { IconButton } from "./button";
import styles from "./home.module.css";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import ExportIcon from "../icons/export.svg";
import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import DeleteIcon from "../icons/delete.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { Message, useChatStore } from "../store";

export function Avatar(props: { role: Message["role"] }) {
  if (props.role === "assistant") {
    return <BotIcon className={styles["user-avtar"]} />;
  }

  return <div className={styles["user-avtar"]}>🤣</div>;
}

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
}) {
  return (
    <div
      className={`${styles["chat-item"]} ${
        props.selected && styles["chat-item-selected"]
      }`}
      onClick={props.onClick}
    >
      <div className={styles["chat-item-title"]}>{props.title}</div>
      <div className={styles["chat-item-info"]}>
        <div className={styles["chat-item-count"]}>{props.count} 条对话</div>
        <div className={styles["chat-item-date"]}>{props.time}</div>
      </div>
      <div className={styles["chat-item-delete"]} onClick={props.onDelete}>
        <DeleteIcon />
      </div>
    </div>
  );
}

export function ChatList() {
  const [sessions, selectedIndex, selectSession, removeSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.removeSession,
    ]
  );

  return (
    <div className={styles["chat-list"]}>
      {sessions.map((item, i) => (
        <ChatItem
          title={item.topic}
          time={item.lastUpdate}
          count={item.messages.length}
          key={i}
          selected={i === selectedIndex}
          onClick={() => selectSession(i)}
          onDelete={() => removeSession(i)}
        />
      ))}
    </div>
  );
}

export function Chat() {
  type RenderMessage = Message & { preview?: boolean };

  const session = useChatStore((state) => state.currentSession());
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onUserInput = useChatStore((state) => state.onUserInput);
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    onUserInput(userInput).then(() => setIsLoading(false));
    setUserInput("");
  };
  const onInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.shiftKey || e.ctrlKey || e.metaKey)) {
      onUserSubmit();
      e.preventDefault();
    }
  };
  const latestMessageRef = useRef<HTMLDivElement>(null);

  const messages = (session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              role: "assistant",
              content: "……",
              date: new Date().toLocaleString(),
              preview: true,
            },
          ]
        : []
    )
    .concat(
      userInput.length > 0
        ? [
            {
              role: "user",
              content: userInput,
              date: new Date().toLocaleString(),
              preview: true,
            },
          ]
        : []
    );

  useEffect(() => {
    latestMessageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  });

  return (
    <div className={styles.chat} key={session.topic}>
      <div className={styles["chat-header"]}>
        <div>
          <div className={styles["chat-header-title"]}>{session.topic}</div>
          <div className={styles["chat-header-sub-title"]}>
            与 ChatGPT 的 {session.messages.length} 条对话
          </div>
        </div>
        <div className={styles["chat-actions"]}>
          <div className={styles["chat-action-button"]}>
            <IconButton icon={<BrainIcon />} bordered />
          </div>
          <div className={styles["chat-action-button"]}>
            <IconButton icon={<ExportIcon />} bordered />
          </div>
        </div>
      </div>

      <div className={styles["chat-body"]}>
        {messages.map((message, i) => {
          const isUser = message.role === "user";

          return (
            <div
              key={i}
              className={
                isUser ? styles["chat-message-user"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-avatar"]}>
                  <Avatar role={message.role} />
                </div>
                {message.preview && (
                  <div className={styles["chat-message-status"]}>正在输入…</div>
                )}
                <div className={styles["chat-message-item"]}>
                  {message.preview && !isUser ? (
                    <LoadingIcon />
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {!isUser && !message.preview && (
                  <div className={styles["chat-message-actions"]}>
                    <div className={styles["chat-message-action-date"]}>
                      {message.date.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <span ref={latestMessageRef} style={{ opacity: 0 }}>
          -
        </span>
      </div>

      <div className={styles["chat-input-panel"]}>
        <div className={styles["chat-input-panel-inner"]}>
          <textarea
            className={styles["chat-input"]}
            placeholder="输入消息，Ctrl + Enter 发送"
            rows={3}
            onInput={(e) => setUserInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={(e) => onInputKeyDown(e as any)}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={"发送"}
            className={styles["chat-input-send"]}
            onClick={onUserSubmit}
          />
        </div>
      </div>
    </div>
  );
}

export function Home() {
  const [createNewSession] = useChatStore((state) => [state.newSession]);

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <div className={styles["sidebar-header"]}>
          <div className={styles["sidebar-title"]}>ChatGPT Next</div>
          <div className={styles["sidebar-sub-title"]}>
            Build your own AI assistant.
          </div>
          <div className={styles["sidebar-logo"]}>
            <ChatGptIcon />
          </div>
        </div>

        <div className={styles["sidebar-body"]}>
          <ChatList />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"]}>
              <IconButton icon={<SettingsIcon />} />
            </div>
            <div className={styles["sidebar-action"]}>
              <a href="https://github.com/Yidadaa" target="_blank">
                <IconButton icon={<GithubIcon />} />
              </a>
            </div>
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={"新的聊天"}
              onClick={createNewSession}
            />
          </div>
        </div>
      </div>

      <Chat key="chat" />
    </div>
  );
}
