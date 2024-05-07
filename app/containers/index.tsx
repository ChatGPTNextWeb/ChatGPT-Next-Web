"use client";

require("../polyfill");

import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect, useLayoutEffect } from "react";

import dynamic from "next/dynamic";
import { Path } from "@/app/constant";
import { ErrorBoundary } from "@/app/components/error";
import { getISOLang } from "@/app/locales";
import { useSwitchTheme } from "@/app/hooks/useSwitchTheme";
import { AuthPage } from "@/app/components/auth";
import { getClientConfig } from "@/app/config/client";
import { useAccessStore, useAppConfig } from "@/app/store";
import { useLoadData } from "@/app/hooks/useLoadData";
import Loading from "@/app/components/Loading";
import Screen from "@/app/components/Screen";
import { SideBar } from "./Sidebar";
import GlobalLoading from "@/app/components/GlobalLoading";
import { MOBILE_MAX_WIDTH } from "../hooks/useListenWinResize";

const Settings = dynamic(
  async () => await import("@/app/containers/Settings"),
  {
    loading: () => <Loading noLogo />,
  },
);

const Chat = dynamic(async () => await import("@/app/containers/Chat"), {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(
  async () => (await import("@/app/components/new-chat")).NewChat,
  {
    loading: () => <Loading noLogo />,
  },
);

const MaskPage = dynamic(
  async () => (await import("@/app/components/mask")).MaskPage,
  {
    loading: () => <Loading noLogo />,
  },
);

function useHtmlLang() {
  useEffect(() => {
    const lang = getISOLang();
    const htmlLang = document.documentElement.lang;

    if (lang !== htmlLang) {
      document.documentElement.lang = lang;
    }
  }, []);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

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

export default function Home() {
  useSwitchTheme();
  useLoadData();
  useHtmlLang();
  const config = useAppConfig();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();
  }, []);

  useLayoutEffect(() => {
    loadAsyncGoogleFont();
    config.update(
      (config) =>
        (config.isMobileScreen = window.innerWidth <= MOBILE_MAX_WIDTH),
    );
  }, []);

  if (!useHasHydrated()) {
    return <GlobalLoading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen noAuth={<AuthPage />} sidebar={<SideBar />}>
          <ErrorBoundary>
            <Routes>
              <Route path={Path.Home} element={<Chat />} />
              <Route
                path={Path.NewChat}
                element={
                  <NewChat
                    className={`
              md:w-[100%] px-1
              ${config.theme === "dark" ? "bg-[var(--white)]" : "bg-gray-50"}
              ${config.isMobileScreen ? "pb-chat-panel-mobile" : ""}
              `}
                  />
                }
              />
              <Route
                path={Path.Masks}
                element={
                  <MaskPage
                    className={`
                md:w-[100%]
                ${config.theme === "dark" ? "bg-[var(--white)]" : "bg-gray-50"}
                ${config.isMobileScreen ? "pb-chat-panel-mobile" : ""}
              `}
                  />
                }
              />
              <Route path={Path.Chat} element={<Chat />} />
              <Route path={Path.Settings} element={<Settings />} />
            </Routes>
          </ErrorBoundary>
        </Screen>
      </Router>
    </ErrorBoundary>
  );
}
