"use client";

require("../polyfill");
import { useState, useEffect } from "react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";
import LeftIcon from "../icons/left.svg";
import RightIcon from "../icons/right.svg";

import { Message, SubmitKey, useChatStore } from "../store";
import { isMobileScreen } from "../utils";
import Locale from "../locales";
import { ChatList } from "./chat-list";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { REPO_URL } from "../constant";
import { ErrorBoundary } from "./error";

import type { Prompt } from "../store/prompt";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"]}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Emoji = dynamic(async () => (await import("emoji-picker-react")).Emoji, {
  loading: () => <LoadingIcon />,
});

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

function useSubmitHandler() {
  const config = useChatStore((state) => state.config);
  const submitKey = config.submitKey;

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && e.nativeEvent.isComposing) return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles["prompt-hints"]}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles["prompt-hint"]}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles["hint-title"]}>{prompt.title}</div>
          <div className={styles["hint-content"]}>{prompt.content}</div>
        </div>
      ))}
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

    const themeColor = getComputedStyle(document.body)
      .getPropertyValue("--theme-color")
      .trim();
    const metaDescription = document.querySelector('meta[name="theme-color"]');
    metaDescription?.setAttribute("content", themeColor);
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function _Home() {
  const [createNewSession, currentIndex, removeSession] = useChatStore(
    (state) => [
      state.newSession,
      state.currentSessionIndex,
      state.removeSession,
    ],
  );
  const loading = !useHasHydrated();
  const [sidebarCollapse, setSideBarCollapse] = useChatStore((state) => [
    state.sidebarCollapse,
    state.setSidebarCollapse,
  ]);

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen()
          ? styles["tight-container"]
          : styles.container
      }`}
    >
      <div
        className={
          sidebarCollapse ? styles["sidebar-collapse"] : styles["sidebar"]
        }
      >
        <div
          className={
            sidebarCollapse
              ? styles["sidebar-header-collapse"]
              : styles["sidebar-header"]
          }
        >
          {sidebarCollapse ? null : (
            <>
              <div className={styles["sidebar-title"]}>ChatGPT Next</div>
              <div className={styles["sidebar-sub-title"]}>
                Build your own AI assistant.
              </div>
            </>
          )}
          {sidebarCollapse ? (
            <div className={styles["sidebar-logo-collapse"]}>
              <ChatGptIcon />
            </div>
          ) : (
            <div className={styles["sidebar-logo"]}>
              <ChatGptIcon />
            </div>
          )}
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => {
            setOpenSettings(false);
            if (window.innerWidth < 768) {
              setSideBarCollapse(true);
            }
          }}
        >
          <ChatList />
        </div>

        <div
          className={
            sidebarCollapse
              ? styles["sidebar-tail-collapse"]
              : styles["sidebar-tail"]
          }
        >
          <div
            className={
              sidebarCollapse
                ? styles["sidebar-actions-collapse"]
                : styles["sidebar-actions"]
            }
          >
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              {sidebarCollapse ? (
                <IconButton
                  icon={<RightIcon />}
                  onClick={() => {
                    setSideBarCollapse(false);
                  }}
                />
              ) : (
                <IconButton
                  icon={<LeftIcon />}
                  onClick={() => {
                    setSideBarCollapse(true);
                  }}
                />
              )}
            </div>
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"] + " " + styles.mobile
              }
            >
              <IconButton
                icon={<CloseIcon />}
                onClick={() => {
                  if (confirm(Locale.Home.DeleteChat)) {
                    removeSession(currentIndex);
                  }
                }}
              />
            </div>

            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setSideBarCollapse(true);
                }}
                shadow
              />
            </div>
            <div
              className={
                sidebarCollapse
                  ? styles["sidebar-action-collapse"]
                  : styles["sidebar-action"]
              }
            >
              <a href={REPO_URL} target="_blank">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
          </div>
          <div
            className={
              sidebarCollapse ? styles["sidebar-action-collapse"] : undefined
            }
          >
            <IconButton
              icon={<AddIcon />}
              text={sidebarCollapse ? undefined : Locale.Home.NewChat}
              onClick={() => {
                createNewSession();
                setSideBarCollapse(true);
              }}
              shadow
            />
          </div>
        </div>
      </div>

      <div
        className={
          sidebarCollapse
            ? styles["window-content-collapse"]
            : styles["window-content"]
        }
      >
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setSideBarCollapse(false);
            }}
          />
        ) : (
          <Chat key="chat" />
        )}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <ErrorBoundary>
      <_Home></_Home>
    </ErrorBoundary>
  );
}
