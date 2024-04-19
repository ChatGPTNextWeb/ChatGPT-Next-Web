import { useLocation } from "react-router-dom";
import { useMemo, ReactNode } from "react";
import { Path, SIDEBAR_ID, SlotID } from "@/app/constant";
import { getLang } from "@/app/locales";

import useMobileScreen from "@/app/hooks/useMobileScreen";
import { isIOS } from "@/app/utils";
import useListenWinResize from "@/app/hooks/useListenWinResize";

interface ScreenProps {
  children: ReactNode;
  noAuth: ReactNode;
  sidebar: ReactNode;
}

export default function Screen(props: ScreenProps) {
  const location = useLocation();
  const isAuth = location.pathname === Path.Auth;

  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  useListenWinResize();

  let containerClassName = "flex h-[100%] w-[100%] bg-center overflow-hidden";
  let sidebarClassName = "flex-0 overflow-hidden";
  let pageClassName = "flex-1 h-[100%] min-w-0 overflow-hidden";

  if (isMobileScreen) {
    containerClassName =
      "relative flex flex-col-reverse h-[100%] w-[100%] bg-center";
    sidebarClassName = "absolute w-[100%] bottom-0 z-10";
    pageClassName = "w-[100%] h-[100%]";
  }

  return (
    <div
      className={`bg-global ${containerClassName}`}
      style={{
        direction: getLang() === "ar" ? "rtl" : "ltr",
      }}
    >
      {isAuth ? (
        props.noAuth
      ) : (
        <>
          <div className={sidebarClassName} id={SIDEBAR_ID}>
            {props.sidebar}
          </div>

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
