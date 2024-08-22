import React, { useEffect, useRef, useMemo, useState, Fragment } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import ChatGptIcon from "../icons/chatgpt.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/clear.svg";
// import MaskIcon from "../icons/mask.svg";
import CoffeeIcon from "../icons/coffee.svg";
import MaskIcon from "../icons/mask.svg";
import DragIcon from "../icons/drag.svg";
import DiscoveryIcon from "../icons/discovery.svg";

import Locale from "../locales";
import { getLang } from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  PLUGINS,
  REPO_URL,
  ServiceProvider,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showConfirm, Selector } from "./ui-lib";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

export function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey) {
        if (e.key === "ArrowUp") {
          chatStore.nextSession(-1);
        } else if (e.key === "ArrowDown") {
          chatStore.nextSession(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

export function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update((config) => {
      if (config.sidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);
      config.update((config) => {
        if (nextWidth < MIN_SIDEBAR_WIDTH) {
          config.sidebarWidth = NARROW_SIDEBAR_WIDTH;
        } else {
          config.sidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}
export function SideBarContainer(props: {
  children: React.ReactNode;
  onDragStart: (e: MouseEvent) => void;
  shouldNarrow: boolean;
  className?: string;
}) {
  // const chatStore = useChatStore();
  // const currentModel = chatStore.currentSession().mask.modelConfig.model;
  // const currentProviderName =
  //     chatStore.currentSession().mask.modelConfig?.providerName ||
  //     ServiceProvider.OpenAI;
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );
  const { children, className, onDragStart, shouldNarrow } = props;
  return (
    <div
      className={`${styles.sidebar} ${className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      {/*<div className={styles["sidebar-header"]}>*/}
      {/*  <div className={styles["sidebar-title"]}>这里开始……</div>*/}
      {/*  <div className={styles["sidebar-sub-title"]}>*/}
      {/*    选择一个你自己的助理*/}
      {/*    <br />*/}
      {/*    <br />*/}
      {/*    1. 有时可能会<b>抽风</b>，点击下方<b>新的聊天</b>试一下吧*/}
      {/*    <br />*/}
      {/*    2. 绘图：“/mj 提示词”*/}
      {/*    的格式生成图片（可以搜一下midjourney的提示词工具或使用方法）*/}
      {/*    <br />*/}
      {/*    3. 如果觉得还不错，可以给作者赏杯咖啡*/}
      {/*  </div>*/}
      {/*  <div className={styles["sidebar-logo"] + " no-dark"}>*/}
      {/*    <ChatGptIcon />*/}
      {/*  </div>*/}
      {/*</div>*/}

      {children}
      <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}

export function SideBarHeader(props: {
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  logo?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { title, subTitle, logo, children } = props;
  return (
    <Fragment>
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title-container"]}>
          <div className={styles["sidebar-title"]} data-tauri-drag-region>
            {title}
          </div>
          <div className={styles["sidebar-sub-title"]}>{subTitle}</div>
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>{logo}</div>
      </div>
      {children}
    </Fragment>
  );
}

export function SideBarBody(props: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}) {
  const { onClick, children } = props;
  return (
    <div className={styles["sidebar-body"]} onClick={onClick}>
      {children}
    </div>
  );
}

export function SideBarTail(props: {
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}) {
  const { primaryAction, secondaryAction } = props;

  return (
    <div className={styles["sidebar-tail"]}>
      <div className={styles["sidebar-actions"]}>{primaryAction}</div>
      <div className={styles["sidebar-actions"]}>{secondaryAction}</div>
    </div>
  );
}

export function SideBar(props: { className?: string }) {
  useHotKey();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const [showPluginSelector, setShowPluginSelector] = useState(false);
  const navigate = useNavigate();
  const config = useAppConfig();
  const chatStore = useChatStore();

  const currentModel = chatStore.currentSession().mask.modelConfig.model;
  const currentProviderName =
    chatStore.currentSession().mask.modelConfig?.providerName ||
    ServiceProvider.OpenAI;

  const lange = getLang();
  const SideBarHeaderTextSubtitle: React.ReactNode = useMemo(() => {
    if (lange === "en") {
      return (
        <span>
          Choose Your Own Assistant
          <br />
          <br />
          1. Sometimes it might act up a bit. Click <b>New Chat</b> below to try
          again. <br />{" "}
          {
            '2. For drawing: Generate images with the format "/mj prompt" (you can look up tools or methods for using MidJourney prompts). '
          }
          <br /> 3. If you find it helpful, consider buying the author a coffee.
        </span>
      );
    }
    return (
      <span>
        选择一个你自己的助理
        <br />
        <br />
        1. 有时可能会<b>抽风</b>，点击下方<b>新的聊天</b>试一下吧
        <br />
        {
          "2. 绘图：“/mj 提示词”的格式生成图片（可以搜一下midjourney的提示词工具或使用方法）"
        }
        <br />
        3. 如果觉得还不错，可以给作者赏杯咖啡
      </span>
    );
  }, [lange]);

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <SideBarHeader
        title={Locale.SideBarHeader.Title}
        subTitle={SideBarHeaderTextSubtitle}
        logo={<ChatGptIcon />}
      >
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<CoffeeIcon />}
            text={shouldNarrow ? undefined : Locale.SideBarHeader.Coffee}
            className={styles["sidebar-bar-button"]}
            onClick={() => navigate(Path.Reward)}
            shadow
          />
          {/*<IconButton*/}
          {/*  icon={<MaskIcon />}*/}
          {/*  text={shouldNarrow ? undefined : Locale.Mask.Name}*/}
          {/*  className={styles["sidebar-bar-button"]}*/}
          {/*  onClick={() => {*/}
          {/*    if (config.dontShowMaskSplashScreen !== true) {*/}
          {/*      navigate(Path.NewChat, { state: { fromHome: true } });*/}
          {/*    } else {*/}
          {/*      navigate(Path.Masks, { state: { fromHome: true } });*/}
          {/*    }*/}
          {/*  }}*/}
          {/*  shadow*/}
          {/*/>*/}
          <IconButton
            icon={<DiscoveryIcon />}
            text={shouldNarrow ? undefined : Locale.Discovery.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => setShowPluginSelector(true)}
            shadow
          />
        </div>
        {showPluginSelector && (
          <Selector
            items={
              [
                {
                  title: "👇 Please select the plugin you need to use",
                  value: "-",
                  disable: true,
                },
                ...PLUGINS.map((item) => {
                  return {
                    title: item.name,
                    value: item.path,
                  };
                }),
              ] as any
            }
            onClose={() => setShowPluginSelector(false)}
            onSelection={(s) => {
              navigate(s[0] as any, { state: { fromHome: true } });
            }}
          />
        )}
      </SideBarHeader>
      <SideBarBody
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        <ChatList narrow={shouldNarrow} />
      </SideBarBody>
      <SideBarTail
        primaryAction={
          <>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<DeleteIcon />}
                onClick={async () => {
                  if (await showConfirm(Locale.Home.DeleteChat)) {
                    chatStore.deleteSession(chatStore.currentSessionIndex);
                  }
                }}
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <Link to={Path.Settings}>
                <IconButton
                  aria={Locale.Settings.Title}
                  icon={<SettingsIcon />}
                  shadow
                />
              </Link>
            </div>
            <div className={styles["sidebar-action"]}>
              {/*<a href={REPO_URL} target="_blank" rel="noopener noreferrer">*/}
              {/*  <IconButton*/}
              {/*    aria={Locale.Export.MessageFromChatGPT}*/}
              {/*    icon={<GithubIcon />}*/}
              {/*    shadow*/}
              {/*  />*/}
              {/*</a>*/}

              <IconButton
                onClick={async () => {
                  if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
                    chatStore.clearAllData();
                  }
                }}
                title={Locale.Settings.Danger.Clear.Title}
                icon={<DeleteIcon />}
                type="danger"
                className={styles["custom-sidebar-clear-button"]}
              />
            </div>
          </>
        }
        secondaryAction={
          <IconButton
            icon={<AddIcon />}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession(
                  undefined,
                  currentModel,
                  currentProviderName,
                );
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        }
      />
    </SideBarContainer>
  );
}
