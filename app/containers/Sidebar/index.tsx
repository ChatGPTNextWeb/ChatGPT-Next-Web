import { useMemo } from "react";
import DragIcon from "@/app/icons/drag.svg";
import DiscoverIcon from "@/app/icons/discoverActive.svg";
import AssistantActiveIcon from "@/app/icons/assistantActive.svg";
import GitHubIcon from "@/app/icons/githubIcon.svg";
import SettingIcon from "@/app/icons/settingActive.svg";
import DiscoverInactiveIcon from "@/app/icons/discoverInactive.svg";
import AssistantInactiveIcon from "@/app/icons/assistantInactive.svg";
import SettingInactiveIcon from "@/app/icons/settingInactive.svg";

import { useAppConfig, useChatStore } from "@/app/store";

import { Path, REPO_URL } from "@/app/constant";

import { useNavigate, useLocation } from "react-router-dom";
import { isIOS } from "@/app/utils";
import dynamic from "next/dynamic";
import useHotKey from "@/app/hooks/useHotKey";
import useDragSideBar from "@/app/hooks/useDragSideBar";
import useMobileScreen from "@/app/hooks/useMobileScreen";
import TabActions from "@/app/components/TabActions";

const SessionList = dynamic(async () => await import("./SessionList"), {
  loading: () => null,
});

const SettingList = dynamic(async () => await import("./SettingList"), {
  loading: () => null,
});

export function SideBar(props: { className?: string }) {
  const chatStore = useChatStore();

  // drag side bar
  const { onDragStart } = useDragSideBar();

  const navigate = useNavigate();
  const loc = useLocation();

  const config = useAppConfig();
  const isMobileScreen = useMobileScreen();
  const isIOSMobile = useMemo(
    () => isIOS() && isMobileScreen,
    [isMobileScreen],
  );

  useHotKey();

  let selectedTab: string;

  switch (loc.pathname) {
    case Path.Masks:
    case Path.NewChat:
      selectedTab = Path.Masks;
      break;
    case Path.Settings:
      selectedTab = Path.Settings;
      break;
    default:
      selectedTab = Path.Chat;
  }

  return (
    <div
      className={` inline-flex h-[100%] ${props.className} relative`}
      style={{
        // #3016 disable transition on ios mobile screen
        transition: isMobileScreen && isIOSMobile ? "none" : undefined,
      }}
    >
      <TabActions
        actionsShema={[
          {
            id: Path.Masks,
            icons: {
              active: <DiscoverIcon />,
              inactive: <DiscoverInactiveIcon />,
            },
          },
          {
            id: Path.Chat,
            icons: {
              active: <AssistantActiveIcon />,
              inactive: <AssistantInactiveIcon />,
            },
          },
          {
            id: "github",
            icons: <GitHubIcon />,
            className: "p-2",
          },
          {
            id: Path.Settings,
            icons: {
              active: <SettingIcon />,
              inactive: <SettingInactiveIcon />,
            },
            className: "p-2",
          },
        ]}
        onSelect={(id) => {
          if (id === "github") {
            return window.open(REPO_URL, "noopener noreferrer");
          }
          if (id !== Path.Masks) {
            return navigate(id);
          }
          if (config.dontShowMaskSplashScreen !== true) {
            navigate(Path.NewChat, { state: { fromHome: true } });
          } else {
            navigate(Path.Masks, { state: { fromHome: true } });
          }
        }}
        groups={[
          [Path.Chat, Path.Masks],
          ["github", Path.Settings],
        ]}
        selected={selectedTab}
        className="px-5 py-6"
      />

      <div
        className={`flex flex-col w-md lg:w-lg 2xl:w-2xl px-6 pb-6 max-md:px-4 max-md:pb-4 bg-gray-50 rounded-md my-2.5 ${
          isMobileScreen && `bg-gray-300`
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        {selectedTab === Path.Chat && <SessionList />}
        {loc.pathname === Path.Settings && <SettingList />}
      </div>

      {!isMobileScreen && (
        <div
          className={`group absolute right-0 h-[100%] flex items-center`}
          onPointerDown={(e) => onDragStart(e as any)}
        >
          <div className="opacity-0 group-hover:bg-[rgba($color: #000000, $alpha: 0.01) group-hover:opacity-20">
            <DragIcon />
          </div>
        </div>
      )}
    </div>
  );
}
