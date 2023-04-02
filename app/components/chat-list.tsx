import { useState, useRef, useEffect, useLayoutEffect } from "react";
import DeleteIcon from "../icons/delete.svg";
import styles from "./home.module.scss";
import BotIcon from "../icons/bot.svg";
import {
  Message,
  SubmitKey,
  useChatStore,
  ChatSession,
  BOT_HELLO,
} from "../store";

import Locale from "../locales";
import { isMobileScreen } from "../utils";

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
        <div className={styles["chat-item-count"]}>
          {Locale.ChatItem.ChatItemCount(props.count)}
        </div>
        <div className={styles["chat-item-date"]}>{props.time}</div>
      </div>
      <div className={styles["chat-item-delete"]} onClick={props.onDelete}>
        <DeleteIcon />
      </div>
    </div>
  );
}

export function ChatList() {
  const [
    sidebarCollapse,
    sessions,
    selectedIndex,
    selectSession,
    removeSession,
  ] = useChatStore((state) => [
    state.sidebarCollapse,
    state.sessions,
    state.currentSessionIndex,
    state.selectSession,
    state.removeSession,
  ]);
  return (
    <>
      <div className={styles["gpt-logo-collapse"]}>
        {sidebarCollapse ? <BotIcon /> : null}
      </div>

      <div className={styles["chat-list"]}>
        {sessions.map((item, i) => (
          <ChatItem
            title={item.topic}
            time={item.lastUpdate}
            count={item.messages.length}
            key={i}
            selected={i === selectedIndex}
            onClick={() => selectSession(i)}
            onDelete={() => confirm(Locale.Home.DeleteChat) && removeSession(i)}
          />
        ))}
      </div>
    </>
  );
}
