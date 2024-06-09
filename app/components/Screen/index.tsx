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

  return (
    <div
      className={`
         flex h-[100%] w-[100%] bg-center
        max-md:relative  max-md:flex-col-reverse  max-md:bg-global-mobile
        md:overflow-hidden md:bg-global
      `}
      style={{
        direction: getLang() === "ar" ? "rtl" : "ltr",
      }}
    >
      {isAuth ? (
        props.noAuth
      ) : (
        <>
          <div
            className={`
              max-md:absolute max-md:w-[100%] max-md:bottom-0 max-md:z-10
              md:flex-0 md:overflow-hidden
            `}
            id={SIDEBAR_ID}
          >
            {props.sidebar}
          </div>

          <div
            className={`
              h-[100%]
              max-md:w-[100%] 
              md:flex-1 md:min-w-0 md:overflow-hidden md:flex
            `}
            id={SlotID.AppBody}
            style={{
              // #3016 disable transition on ios mobile screen
              transition: isIOSMobile ? "none" : undefined,
            }}
          >
            {props.children}
          </div>
        </>
      )}
    </div>
  );
}
