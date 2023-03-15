"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RehypeKatex from "rehype-katex";

import { Emoji } from "emoji-picker-react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

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
import MenuIcon from "../icons/menu.svg";
import CloseIcon from "../icons/close.svg";

import { Message, SubmitKey, useChatStore, Theme } from "../store";
import { Settings } from "./settings";

export function Markdown(props: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[RemarkMath]} rehypePlugins={[RehypeKatex]}>
      {props.content}
    </ReactMarkdown>
  );
}

export function Avatar(props: { role: Message["role"] }) {
  const config = useChatStore((state) => state.config);

  if (props.role === "assistant") {
    return <BotIcon className={styles["user-avtar"]} />;
  }

  return (
    <div className={styles["user-avtar"]}>
      <Emoji unified={config.avatar} size={18} />
    </div>
  );
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
      className={`${styles["chat-item"]} ${props.selected && styles["chat-item-selected"]
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

function useSubmitHandler() {
  const config = useChatStore((state) => state.config);
  const submitKey = config.submitKey;

  const shouldSubmit = (e: KeyboardEvent) => {
    if (e.key !== "Enter") return false;

    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      config.submitKey === SubmitKey.Enter
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function Chat(props: { showSideBar?: () => void }) {
  type RenderMessage = Message & { preview?: boolean };

  const session = useChatStore((state) => state.currentSession());
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { submitKey, shouldSubmit } = useSubmitHandler();

  const onUserInput = useChatStore((state) => state.onUserInput);
  const onUserSubmit = () => {
    if (userInput.length <= 0) return;
    setIsLoading(true);
    onUserInput(userInput).then(() => setIsLoading(false));
    setUserInput("");
  };
  const onInputKeyDown = (e: KeyboardEvent) => {
    if (shouldSubmit(e)) {
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
    <div className={styles.chat} key={session.id}>
      <div className={styles["window-header"]}>
        <div>
          <div className={styles["window-header-title"]}>{session.topic}</div>
          <div className={styles["window-header-sub-title"]}>
            与 ChatGPT 的 {session.messages.length} 条对话
          </div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"] + " " + styles.mobile}>
            <IconButton
              icon={<MenuIcon />}
              bordered
              title="查看消息列表"
              onClick={props?.showSideBar}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<BrainIcon />}
              bordered
              title="查看压缩后的历史 Prompt（开发中）"
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ExportIcon />}
              bordered
              title="导出聊天记录为 Markdown（开发中）"
            />
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
                {(message.preview || message.streaming) && (
                  <div className={styles["chat-message-status"]}>正在输入…</div>
                )}
                <div className={styles["chat-message-item"]}>
                  {(message.preview || message.content.length === 0) &&
                    !isUser ? (
                    <LoadingIcon />
                  ) : (
                    <div className="markdown-body">
                      <Markdown content={message.content} />
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
            placeholder={`输入消息，${submitKey} 发送`}
            rows={3}
            onInput={(e) => setUserInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={(e) => onInputKeyDown(e as any)}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={"发送"}
            className={styles["chat-input-send"] + " no-dark"}
            onClick={onUserSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");
    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }
  }, [config.theme]);
}

export function Home() {
  const [createNewSession] = useChatStore((state) => [state.newSession]);
  const loading = !useChatStore?.persist?.hasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);

  // settings
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  useSwitchTheme();

  if (loading) {
    return (
      <div>
        <Avatar role="assistant"></Avatar>
        <LoadingIcon />
      </div>
    );
  }

  return (
    <div
      className={`${config.tightBorder ? styles["tight-container"] : styles.container
        }`}
    >
      <div
        className={styles.sidebar + ` ${showSideBar && styles["sidebar-show"]}`}
        onClick={() => setShowSideBar(false)}
      >
        <div className={styles["sidebar-header"]}>
          <div className={styles["sidebar-title"]}>ChatGPT Next</div>
          <div className={styles["sidebar-sub-title"]}>
            Build your own AI assistant.
          </div>
          <div className={styles["sidebar-logo"]}>
            <ChatGptIcon />
          </div>
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => setOpenSettings(false)}
        >
          <ChatList />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => setShowSideBar(!showSideBar)}
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => setOpenSettings(!openSettings)}
              />
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

      <div className={styles["window-content"]}>
        {openSettings ? (
          <Settings closeSettings={() => setOpenSettings(false)} />
        ) : (
          <Chat key="chat" showSideBar={() => setShowSideBar(true)} />
        )}
      </div>
    </div>
  );
}
