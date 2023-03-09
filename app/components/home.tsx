"use client";

import { IconButton } from "./button";
import styles from "./home.module.css";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import SendWhiteIcon from "../icons/send-white.svg";
import BrainIcon from "../icons/brain.svg";
import ExportIcon from "../icons/export.svg";
import BotIcon from "../icons/bot.svg";
import UserIcon from "../icons/user.svg";
import AddIcon from "../icons/add.svg";

export function ChatItem(props: {
  onClick?: () => void;
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
    >
      <div className={styles["chat-item-title"]}>{props.title}</div>
      <div className={styles["chat-item-info"]}>
        <div className={styles["chat-item-count"]}>{props.count} 条对话</div>
        <div className={styles["chat-item-date"]}>{props.time}</div>
      </div>
    </div>
  );
}

export function ChatList() {
  const listData = new Array(5).fill({
    title: "这是一个标题",
    count: 10,
    time: new Date().toLocaleString(),
  });

  const selectedIndex = 0;

  return (
    <div className={styles["chat-list"]}>
      {listData.map((item, i) => (
        <ChatItem {...item} key={i} selected={i === selectedIndex} />
      ))}
    </div>
  );
}

export function Chat() {
  const messages = [
    {
      role: "user",
      content: "这是一条消息",
      date: new Date().toLocaleString(),
    },
    {
      role: "bot",
      content: "这是一条回复".repeat(10),
      date: new Date().toLocaleString(),
    },
  ];

  const title = "这是一个标题";
  const count = 10;

  return (
    <div className={styles.chat}>
      <div className={styles["chat-header"]}>
        <div>
          <div className={styles["chat-header-title"]}>{title}</div>
          <div className={styles["chat-header-sub-title"]}>
            与 ChatGPT 的 {count} 条对话
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
                isUser ? styles["chat-message-reverse"] : styles["chat-message"]
              }
            >
              <div className={styles["chat-message-container"]}>
                <div className={styles["chat-message-avtar"]}>
                  {message.role === "user" ? <UserIcon /> : <BotIcon />}
                </div>
                <div className={styles["chat-message-item"]}>
                  {message.content}
                </div>
                {!isUser && (
                  <div className={styles["chat-message-actions"]}>
                    <div className={styles["chat-message-action-date"]}>
                      {message.date}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles["chat-input-panel"]}>
        <div className={styles["chat-input-panel-inner"]}>
          <textarea
            className={styles["chat-input"]}
            placeholder="输入消息"
            rows={3}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={"发送"}
            className={styles["chat-input-send"]}
          />
        </div>
      </div>
    </div>
  );
}

export function Home() {
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
              <IconButton icon={<GithubIcon />} />
            </div>
          </div>
          <div>
            <IconButton icon={<AddIcon />} text={"新的聊天"} />
          </div>
        </div>
      </div>

      <Chat key="chat" />
    </div>
  );
}
