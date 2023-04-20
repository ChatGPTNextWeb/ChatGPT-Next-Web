import { useState, useEffect, useRef } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import Locale from "../locales";

import { useChatStore } from "../store";

import { Path, REPO_URL } from "../constant";

import { HashRouter as Router, Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import { ChatList } from "./chat-list";

function useDragSideBar() {
  const limit = (x: number) => Math.min(500, Math.max(220, x));

  const chatStore = useChatStore();
  const startX = useRef(0);
  const startDragWidth = useRef(chatStore.config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 100) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    chatStore.updateConfig((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = chatStore.config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    const sideBarWidth = isMobileScreen
      ? "100vw"
      : `${limit(chatStore.config.sidebarWidth ?? 300)}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [chatStore.config.sidebarWidth, isMobileScreen]);

  return {
    onDragMouseDown,
  };
}

export function SideBar(props: { setShowSideBar?: (_: boolean) => void }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragMouseDown } = useDragSideBar();
  const navigate = useNavigate();
  const isMobileScreen = useMobileScreen();

  return (
    <>
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
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
          props.setShowSideBar?.(false);
        }}
      >
        <ChatList />
      </div>

      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"] + " " + styles.mobile}>
            <IconButton
              icon={<CloseIcon />}
              onClick={chatStore.deleteSession}
            />
          </div>
          <div className={styles["sidebar-action"]}>
            <Link to={Path.Settings}>
              <IconButton icon={<SettingsIcon />} shadow />
            </Link>
          </div>
          <div className={styles["sidebar-action"]}>
            <a href={REPO_URL} target="_blank">
              <IconButton icon={<GithubIcon />} shadow />
            </a>
          </div>
        </div>
        <div>
          <IconButton
            icon={<AddIcon />}
            text={Locale.Home.NewChat}
            onClick={() => {
              chatStore.newSession();
              props.setShowSideBar?.(false);
            }}
            shadow
          />
        </div>
      </div>

      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
    </>
  );
}
