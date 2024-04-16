import { useLocation } from "react-router-dom";
import { useMemo, ReactNode, useLayoutEffect } from "react";
import { DEFAULT_SIDEBAR_WIDTH, Path, SlotID } from "@/app/constant";
import { getLang } from "@/app/locales";

import useMobileScreen from "@/app/hooks/useMobileScreen";
import { isIOS } from "@/app/utils";

import backgroundUrl from "!url-loader!@/app/icons/background.svg";
import useListenWinResize from "@/app/hooks/useListenWinResize";

interface ScreenProps {
  children: ReactNode;
  noAuth: ReactNode;
  sidebar: ReactNode;
}

export default function Screen(props: ScreenProps) {
  const location = useLocation();
  const isAuth = location.pathname === Path.Auth;
  const isHome = location.pathname === Path.Home;

  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  useListenWinResize();

  let containerClassName = "flex h-[100%] w-[100%]";
  let pageClassName = "flex-1 h-[100%]";
  let sidebarClassName = "basis-sidebar h-[100%]";

  if (isMobileScreen) {
    containerClassName = "h-[100%] w-[100%] relative bg-center";
    pageClassName = `absolute top-0 h-[100%] w-[100%] ${
      !isHome ? "left-0" : "left-[101%]"
    } z-10`;
    sidebarClassName = `h-[100%] w-[100%]`;
  }

  return (
    <div
      className={containerClassName}
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        direction: getLang() === "ar" ? "rtl" : "ltr",
      }}
    >
      {isAuth ? (
        props.noAuth
      ) : (
        <>
          <div className={sidebarClassName}>{props.sidebar}</div>

          <div
            className={pageClassName}
            id={SlotID.AppBody}
            style={{
              // #3016 disable transition on ios mobile screen
              transition: isMobileScreen && isIOSMobile ? "none" : undefined,
            }}
          >
            {props.children}
          </div>
        </>
      )}
    </div>
  );
}
