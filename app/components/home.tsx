"use client";

require("../polyfill");

import { useEffect, useRef, useState } from "react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import ChatGptIcon from "../icons/chatgpt.svg";

import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";

import { useChatStore } from "../store";
import { getCSSVar, useMobileScreen } from "../utils";
import Locale from "../locales";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "./error";

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

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => <Loading noLogo />,
});

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

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--themeColor");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);

  //左边
  useEffect(() => {
    /**
     * 左边广告位
     */
    //声明div
    const leftDiv = document.createElement("div");
    //设置元素class或者id
    //设置id为leftDiv
    leftDiv.setAttribute("id", "leftDiv");
    //设置宽
    leftDiv.style.width = "18%";
    //设置高
    leftDiv.style.height = "89%";
    //背景色用于调试用
    // leftDiv.style.backgroundColor = "rgba(255,0,0,0.1)";
    //居左
    document.body.style.textAlign = "left";
    //固定
    leftDiv.style.position = "fixed";
    //距离左边距
    leftDiv.style.left = "0.3%";
    //叠加
    leftDiv.style.zIndex = "999";

    //用于关闭广告的
    const closeDiv = document.createElement("div");

    // closeDiv.style.width = "6%";
    closeDiv.style.height = "3%";
    //居右
    closeDiv.style.float = "right";
    // closeDiv.style.backgroundColor = 'rgba(255,0,0,0.1)';

    //显示关闭按钮
    const span = document.createElement("span");
    span.innerText = "×";

    //把span加入div
    closeDiv.appendChild(span);

    //把关闭div放入最大的div内
    leftDiv.appendChild(closeDiv);

    //广告位主体的div
    const internalDiv = document.createElement("div");

    internalDiv.style.width = "100%";
    // internalDiv.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    internalDiv.style.paddingTop = "6%";

    //广告图片
    const leftImg = document.createElement("img");

    leftImg.src = "/gaobaipingtai.jpg";
    leftImg.style.width = "100%";
    leftImg.style.height = "100%";

    internalDiv.appendChild(leftImg);

    leftDiv.appendChild(internalDiv);

    //把左边广告位div放入body中
    document.body.appendChild(leftDiv);

    // 添加鼠标移入事件
    leftImg.addEventListener("mouseover", function () {
      // leftImg.style.display = 'none';
      leftImg.src = "/gaobaiguanzhu.png";
      // internalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });

    // 添加鼠标移出事件
    leftImg.addEventListener("mouseout", function () {
      leftImg.src = "/gaobaipingtai.jpg";
      // internalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    });

    // 添加点击事件监听器
    closeDiv.addEventListener("click", function () {
      // 移除内部所有子元素
      while (leftDiv.firstChild) {
        leftDiv.removeChild(leftDiv.firstChild);
      }

      // 移除自身
      leftDiv.remove();
    });

    // 添加点击事件监听器
    internalDiv.addEventListener("click", function () {
      window.open("https://letter.ixiaohe.top/");
    });
  }, [config]);

  //右边
  useEffect(() => {
    /**
     * 左边广告位
     */
    //声明div
    const rightDiv = document.createElement("div");
    //设置元素class或者id
    //设置id为leftDiv
    rightDiv.setAttribute("id", "leftDiv");
    //设置宽
    rightDiv.style.width = "18%";
    //设置高
    rightDiv.style.height = "89%";
    //背景色用于调试用
    // leftDiv.style.backgroundColor = "rgba(255,0,0,0.1)";
    //居左
    // document.body.style.textAlign = "right";
    //固定
    rightDiv.style.position = "fixed";
    //距离左边距
    rightDiv.style.right = "0.3%";
    //叠加
    rightDiv.style.zIndex = "999";

    //用于关闭广告的
    const closeDiv = document.createElement("div");

    // closeDiv.style.width = "6%";
    closeDiv.style.height = "3%";
    //居右
    closeDiv.style.float = "right";
    // closeDiv.style.backgroundColor = 'rgba(255,0,0,0.1)';

    //显示关闭按钮
    const span = document.createElement("span");
    span.innerText = "×";

    //把span加入div
    closeDiv.appendChild(span);

    //把关闭div放入最大的div内
    rightDiv.appendChild(closeDiv);

    //广告位主体的div
    const internalDiv = document.createElement("div");

    internalDiv.style.width = "100%";
    // internalDiv.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    internalDiv.style.paddingTop = "6%";

    //广告图片
    const rightImg = document.createElement("img");

    rightImg.src = "/gaobaipingtai.jpg";
    rightImg.style.width = "100%";
    rightImg.style.height = "100%";

    internalDiv.appendChild(rightImg);

    rightDiv.appendChild(internalDiv);

    //把左边广告位div放入body中
    document.body.appendChild(rightDiv);

    // 添加鼠标移入事件
    rightImg.addEventListener("mouseover", function () {
      // leftImg.style.display = 'none';
      rightImg.src = "/gaobaiguanzhu.png";
      // internalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    });

    // 添加鼠标移出事件
    rightImg.addEventListener("mouseout", function () {
      rightImg.src = "/gaobaipingtai.jpg";
      // internalDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    });

    // 添加点击事件监听器
    closeDiv.addEventListener("click", function () {
      // 移除内部所有子元素
      while (rightDiv.firstChild) {
        rightDiv.removeChild(rightDiv.firstChild);
      }

      // 移除自身
      rightDiv.remove();
    });

    // 添加点击事件监听器
    internalDiv.addEventListener("click", function () {
      // window.location.href = 'weixin://dl/miniprogram?appId=wx28e3b98396801326&path=/pages/home/index&type=0';
      window.location.href = "weixin://profile/gh_d2e49475117d";
    });
  }, [config]);
}

function leftDivFun() {}

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
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  // drag side bar
  const { onDragMouseDown } = useDragSideBar();
  const isMobileScreen = useMobileScreen();

  useSwitchTheme();
  leftDivFun();

  if (loading) {
    return <Loading />;
  }

  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen
          ? styles["tight-container"]
          : styles.container
      }`}
    >
      <div
        className={styles.sidebar + ` ${showSideBar && styles["sidebar-show"]}`}
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
          onClick={() => {
            setOpenSettings(false);
            setShowSideBar(false);
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
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              />
            </div>
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={Locale.Home.NewChat}
              onClick={() => {
                createNewSession();
                setShowSideBar(false);
              }}
              shadow
            />
          </div>
        </div>

        <div
          className={styles["sidebar-drag"]}
          onMouseDown={(e) => onDragMouseDown(e as any)}
        ></div>
      </div>

      <div className={styles["window-content"]}>
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setShowSideBar(true);
            }}
          />
        ) : (
          <Chat
            key="chat"
            showSideBar={() => setShowSideBar(true)}
            sideBarShowing={showSideBar}
          />
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
