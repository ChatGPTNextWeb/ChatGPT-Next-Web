"use client";
import { useEffect, useRef, useMemo } from "react";

import styles from "../../components/chatHomepage.module.scss";

import VariantGptIcon from "../../icons/robotgpt.svg";
import DragIcon from "../../icons/drag.svg";
import { usePathname } from "next/navigation";

import { useAppConfig, useChatStore } from "../../store";

import {
  DEFAULT_SALES_SIDEBAR_WIDTH as DEFAULT_SIDEBAR_WIDTH,
  MAX_SALES_SIDEBAR_WIDTH as MAX_SIDEBAR_WIDTH,
  MIN_SALES_SIDEBAR_WIDTH as MIN_SIDEBAR_WIDTH,
  NARROW_SALES_SIDEBAR_WIDTH as NARROW_SIDEBAR_WIDTH,
} from "../../constant";

import { useNavigate } from "react-router-dom";
import { isIOS, useMobileScreen } from "../../utils";
import dynamic from "next/dynamic";

interface SidebarProps {
  title: string;
  subtitle: string;
  className?: string;
  children?: React.ReactNode;
}

const ChatList = dynamic(
  async () => (await import("../../components/chat-list")).ChatList,
  {
    loading: () => null,
  },
);

function useHotKey() {
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

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(
    config.salesSidebarWidth ?? DEFAULT_SIDEBAR_WIDTH,
  );
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update((config) => {
      if (config.salesSidebarWidth < MIN_SIDEBAR_WIDTH) {
        config.salesSidebarWidth = DEFAULT_SIDEBAR_WIDTH;
      } else {
        config.salesSidebarWidth = NARROW_SIDEBAR_WIDTH;
      }
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.salesSidebarWidth;
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
          config.salesSidebarWidth = MIN_SIDEBAR_WIDTH;
        } else {
          config.salesSidebarWidth = nextWidth;
        }
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.salesSidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.salesSidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.salesSidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.salesSidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragStart,
    shouldNarrow,
  };
}

export function SalesSidebar(props: SidebarProps) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();
  const isMobileScreen = useMobileScreen();
  const pathName = usePathname();
  const isUrlSalesGPT = () => {
    if (pathName.includes("salesGPT")) {
      return true;
    } else {
      return false;
    }
  };

  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className}`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          {props.title}
        </div>
        <div className={styles["sidebar-sub-title"]}>{props.subtitle}</div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <VariantGptIcon />
        </div>
      </div>

      <div className={styles["sidebar-body"]}>{props.children}</div>

      <div
        className={styles["sidebar-drag"]}
        onPointerDown={(e) => onDragStart(e as any)}
      >
        <DragIcon />
      </div>
    </div>
  );
}
