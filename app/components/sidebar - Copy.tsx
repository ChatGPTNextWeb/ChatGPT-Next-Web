<<<<<<< HEAD
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
//import Image from 'next/image'; // Import the Image component from Next.js
=======
import React, { useEffect, useRef, useMemo, useState, Fragment } from "react";
>>>>>>> upstream/main

import styles from "./home.module.scss";

import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DragIcon from "../icons/drag.svg";
import GithubIcon from "../icons/github.svg";
import MaskIcon from "../icons/mask.svg";
<<<<<<< HEAD
import PluginIcon from "../icons/plugin.svg";
import SettingsIcon from "../icons/settings.svg";
import SignoutIcon from "../icons/signout.svg";
import { IconButton } from "./button";
=======
import DragIcon from "../icons/drag.svg";
import DiscoveryIcon from "../icons/discovery.svg";
>>>>>>> upstream/main

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  PLUGINS,
  REPO_URL,
} from "../constant";

import { signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { Link, useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "../utils";
<<<<<<< HEAD
import { showConfirm, showToast } from "./ui-lib";
=======
import dynamic from "next/dynamic";
import { showConfirm, Selector } from "./ui-lib";
>>>>>>> upstream/main

import UsageStats from './usage-stats/UsageStats';


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
<<<<<<< HEAD

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  const [showUsageStats, setShowUsageStats] = useState(false); // State to control the visibility of the usage stats
  const toggleUsageStats = () => setShowUsageStats(!showUsageStats); // Function to toggle the usage stats UI


  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();
=======
export function SideBarContainer(props: {
  children: React.ReactNode;
  onDragStart: (e: MouseEvent) => void;
  shouldNarrow: boolean;
  className?: string;
}) {
>>>>>>> upstream/main
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );
<<<<<<< HEAD

  const usageStatsComponent = showUsageStats && <UsageStats onClose={() => setShowUsageStats(false)} />;

  useHotKey();

  return (
    <>
      {usageStatsComponent} {/* This is where the UsageStats component gets rendered */}
      <div
        className={`${styles.sidebar} ${props.className} ${
          shouldNarrow && styles["narrow-sidebar"]
        }`}
        style={{
          // #3016 disable transition on ios mobile screen
          transition: isMobileScreen && isIOSMobile ? "none" : undefined,
        }}
      >
        <div className={styles["sidebar-header"]} data-tauri-drag-region>
          <div className={styles["sidebar-title"]} data-tauri-drag-region>
            AdEx<b>GPT</b> - via API
          </div>
          <div className={styles["sidebar-sub-title"]}>
            secure local UI for&nbsp;
            <span 
              className={styles["api-link"]} // You might need to define this style
              onClick={toggleUsageStats}
              role="button" // Accessibility improvement
              tabIndex={0} // Accessibility improvement
            >
              OpenAI API
            </span>
            <br />
            <a href="https://adexpartners.sharepoint.com/sites/AdExGPT/SitePages/AdExGPT.aspx">
              FAQ & Support
            </a>
          </div>
          <div className={styles["sidebar-logo"] + " no-dark"}>
            {/* Replace img with Image component and add an alt attribute */}
            <img
              src="https://assets.cdn.personio.de/logos/85756/default/fc91989a7a2e899e3655593e271461aa.jpg"
              width="60"
              height="60" // You need to add the height property as well
              alt="AdEx Logo" // Provide a meaningful alt text or an empty string if the image is decorative
            />
          </div>
        </div>

        <div className={styles["sidebar-header-bar"]}>
=======
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
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          {title}
        </div>
        <div className={styles["sidebar-sub-title"]}>{subTitle}</div>
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

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <SideBarHeader
        title="NextChat"
        subTitle="Build your own AI assistant."
        logo={<ChatGptIcon />}
      >
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<MaskIcon />}
            text={shouldNarrow ? undefined : Locale.Mask.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => {
              if (config.dontShowMaskSplashScreen !== true) {
                navigate(Path.NewChat, { state: { fromHome: true } });
              } else {
                navigate(Path.Masks, { state: { fromHome: true } });
              }
            }}
            shadow
          />
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
            items={[
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
            ]}
            onClose={() => setShowPluginSelector(false)}
            onSelection={(s) => {
              navigate(s[0], { state: { fromHome: true } });
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
                <IconButton icon={<SettingsIcon />} shadow />
              </Link>
            </div>
            <div className={styles["sidebar-action"]}>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
          </>
        }
        secondaryAction={
>>>>>>> upstream/main
          <IconButton
            icon={<MaskIcon />}
            text={shouldNarrow ? undefined : Locale.Mask.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => {
              if (config.dontShowMaskSplashScreen !== true) {
                navigate(Path.NewChat, { state: { fromHome: true } });
              } else {
                navigate(Path.Masks, { state: { fromHome: true } });
              }
            }}
            shadow
          />
<<<<<<< HEAD
          <IconButton
            icon={<PluginIcon />}
            text={shouldNarrow ? undefined : Locale.Plugin.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() => showToast(Locale.WIP)}
            shadow
          />
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              navigate(Path.Home);
            }
          }}
        >
          <ChatList narrow={shouldNarrow} />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<CloseIcon />}
                onClick={async () => {
                  if (await showConfirm(Locale.Home.DeleteChat)) {
                    chatStore.deleteSession(chatStore.currentSessionIndex);
                  }
                }}
              />
            </div>

            <div className={styles["sidebar-action"]}>
              <Link to={Path.Settings}>
                <IconButton icon={<SettingsIcon />} shadow />
              </Link>
            </div>

            <div className={styles["sidebar-action"]}>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>

            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SignoutIcon />}
                shadow
                onClick={() => signOut()}
              />
            </div>
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={shouldNarrow ? undefined : Locale.Home.NewChat}
              onClick={() => {
                if (config.dontShowMaskSplashScreen) {
                  chatStore.newSession();
                  navigate(Path.Chat);
                } else {
                  navigate(Path.NewChat);
                }
              }}
              shadow
            />
          </div>
        </div>

        <div
          className={styles["sidebar-drag"]}
          onPointerDown={(e) => onDragStart(e as any)}
        >
          <DragIcon />
        </div>
      </div>
    </>
    
=======
        }
      />
    </SideBarContainer>
>>>>>>> upstream/main
  );
}
