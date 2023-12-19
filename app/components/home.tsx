"use client";

require("../polyfill");

import { useState, useEffect, ComponentType } from "react";

import styles from "./home.module.scss";

import BotIcon from "../icons/bot.svg";
import LoadingIcon from "../icons/three-dots.svg";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import { getLang } from "../locales";

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

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

interface IRoutePath {
  Path: string;
  Element: ComponentType<{}>;
}

const RoutePaths: IRoutePath[] = [
  {
    Path: Path.Home,
    Element: dynamic(async () => (await import("./mask")).MaskPage, {
      loading: () => <Loading noLogo />,
    }),
  },
  {
    Path: Path.Chat,
    Element: dynamic(async () => (await import("./chat")).Chat, {
      loading: () => <Loading noLogo />,
    }),
  },
  {
    Path: Path.NewChat,
    Element: dynamic(async () => (await import("./new-chat")).NewChat, {
      loading: () => <Loading noLogo />,
    }),
  },
  {
    Path: Path.Masks,
    Element: dynamic(async () => (await import("./mask")).MaskPage, {
      loading: () => <Loading noLogo />,
    }),
  },
  {
    Path: Path.Settings,
    Element: dynamic(async () => (await import("./settings")).Settings, {
      loading: () => <Loading noLogo />,
    }),
  },
  {
    Path: Path.UserLogin,
    Element: dynamic(
      async () => (await import("../user-setting/user-login")).UserLogin,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.UserLoginDetail,
    Element: dynamic(
      async () =>
        (await import("../user-setting/user-login-detail")).UserLoginDetail,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.UserRegister,
    Element: dynamic(
      async () => (await import("../user-setting/user-register")).UserRegister,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.UserOrder,
    Element: dynamic(
      async () => (await import("../user-setting/user-order")).UserOrder,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ImpromptuSpeechCopilot,
    Element: dynamic(
      async () => (await import("../toastmasters/ISpeech-Copilot")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToastmastersTTMaster,
    Element: dynamic(
      async () => (await import("../toastmasters/chat-ttmaster")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToastmastersTTEvaluator,
    Element: dynamic(
      async () => (await import("../toastmasters/chat-ttevaluator")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToastmastersISEvaluator,
    Element: dynamic(
      async () => (await import("../toastmasters/chat-isevaluator")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToastmastersPSEvaluator,
    Element: dynamic(
      async () => (await import("../toastmasters/chat-psevaluator")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToastmastersTimer,
    Element: dynamic(
      async () => (await import("../toastmasters/chat-timer")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.InterviewSelfServe,
    Element: dynamic(
      async () => (await import("../interview/self-serve-interview")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
  {
    Path: Path.ToeflIntegratedWriting,
    Element: dynamic(
      async () => (await import("../toefl/Toefl-IntegratedWriting")).Chat,
      {
        loading: () => <Loading noLogo />,
      },
    ),
  },
];

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
    "/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isAuth = location.pathname === Path.Auth;
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);

  return (
    <div
      className={
        styles.container +
        ` ${
          config.tightBorder && !isMobileScreen
            ? styles["tight-container"]
            : styles.container
          // } ${getLang() === "ar" ? styles["rtl-screen"] : ""}`
        } ${""}`
      }
    >
      {isAuth ? (
        <>
          <AuthPage />
        </>
      ) : (
        <>
          <SideBar className={isHome ? styles["sidebar-show"] : ""} />

          <div className={styles["window-content"]} id={SlotID.AppBody}>
            <Routes>
              {RoutePaths.map((item, index) => (
                <Route
                  path={item.Path}
                  element={<item.Element />}
                  key={index}
                />
              ))}
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export function Home() {
  useSwitchTheme();

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
  }, []);

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
