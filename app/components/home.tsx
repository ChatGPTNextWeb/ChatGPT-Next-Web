"use client";

require("../polyfill");

import { useState, useEffect } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getISOLang, getLang } from "../locales";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { AuthPage } from "./auth";
import { getClientConfig } from "../config/client";
import { type ClientApi, getClientApi } from "../client/api";
import { useAccessStore } from "../store";

// Loading组件用于显示加载状态
export function Loading(props: { noLogo?: boolean }) {
  return (
    // 使用styles["loading-content"]类名来应用样式，"no-dark"类用于防止暗色主题影响
    <div className={styles["loading-content"] + " no-dark"}>
      {/* 如果noLogo属性为false，则显示BotIcon */}
      {!props.noLogo && <BotIcon />}
      {/* 显示LoadingIcon表示正在加载 */}
      <LoadingIcon />
    </div>
  );
}

const Artifacts = dynamic(async () => (await import("./artifacts")).Artifacts, {
  loading: () => <Loading noLogo />,
});

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

const Sd = dynamic(async () => (await import("./sd")).Sd, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

// 定义一个自定义Hook：useHasHydrated
const useHasHydrated = () => {
  // 使用useState初始化hasHydrated状态为false
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  // 使用useEffect在组件挂载后将hasHydrated设置为true
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  // 返回hasHydrated的当前值
  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  const proxyFontUrl = "/google-fonts";
  const remoteFontUrl = "https://fonts.googleapis.com";
  const googleFontUrl =
    getClientConfig()?.buildMode === "export" ? remoteFontUrl : proxyFontUrl;
  linkEl.rel = "stylesheet";
  linkEl.href =
    googleFontUrl +
    "/css2?family=" +
    encodeURIComponent("Noto Sans:wght@300;400;700;900") +
    "&display=swap";
  document.head.appendChild(linkEl);
};

export function WindowContent(props: { children: React.ReactNode }) {
  return (
    <div className={styles["window-content"]} id={SlotID.AppBody}>
      {props?.children}
    </div>
  );
}

// Screen 组件：负责渲染应用的主要内容
function Screen() {
  // 获取应用配置
  const config = useAppConfig();
  // 获取当前路由位置
  const location = useLocation();
  // 判断当前路径是否为特定页面
  const isArtifact = location.pathname.includes(Path.Artifacts);
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isSd = location.pathname === Path.Sd;
  const isSdNew = location.pathname === Path.SdNew;

  // 检查是否为移动屏幕
  const isMobileScreen = useMobileScreen();
  // 决定是否使用紧凑边框
  const shouldTightBorder =
    getClientConfig()?.isApp || (config.tightBorder && !isMobileScreen);

  // 加载Google字体
  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  // 如果是Artifacts页面，渲染特定路由
  if (isArtifact) {
    return (
      <Routes>
        <Route path="/artifacts/:id" element={<Artifacts />} />
      </Routes>
    );
  }

  // 渲染主要内容的函数
  const renderContent = () => {
    if (isAuth) return <AuthPage />;
    if (isSd) return <Sd />;
    if (isSdNew) return <Sd />;
    return (
      <>
        {/* 侧边栏 */}
        <SideBar className={isHome ? styles["sidebar-show"] : ""} />
        {/* 主区域 */}
        <WindowContent>
          <Routes>
            <Route path={Path.Home} element={<Chat />} />
            <Route path={Path.NewChat} element={<NewChat />} />
            <Route path={Path.Masks} element={<MaskPage />} />
            <Route path={Path.Chat} element={<Chat />} />
            <Route path={Path.Settings} element={<Settings />} />
          </Routes>
        </WindowContent>
      </>
    );
  };

  // 返回最终的渲染结果
  return (
    <div
      className={`${styles.container} ${
        shouldTightBorder ? styles["tight-container"] : styles.container
      } ${getLang() === "ar" ? styles["rtl-screen"] : ""}`}
    >
      {renderContent()}
    </div>
  );
}

// 定义一个自定义Hook：useLoadData
export function useLoadData() {
  // 获取应用配置
  const config = useAppConfig();

  // 根据配置中的提供商名称获取客户端API
  const api: ClientApi = getClientApi(config.modelConfig.providerName);

  // 使用useEffect钩子在组件挂载时加载数据
  useEffect(() => {
    // 定义一个异步函数来获取模型
    (async () => {
      // 从API获取模型列表
      const models = await api.llm.models();
      // 将获取到的模型合并到配置中
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export function Home() {
  // 切换主题
  useSwitchTheme();
  // 加载数据
  useLoadData();
  // 设置HTML语言
  useHtmlLang();

  useEffect(() => {
    // 从构建时获取配置并打印日志
    console.log("[Config] got config from build time", getClientConfig());
    // 获取访问权限
    useAccessStore.getState().fetch();
  }, []);

  // 如果组件还未水合，显示加载中
  if (!useHasHydrated()) {
    return <Loading />;
  }

  // 渲染主要内容
  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
