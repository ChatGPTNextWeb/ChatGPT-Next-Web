import DragIcon from "@/app/icons/drag.svg";
import DiscoverIcon from "@/app/icons/discoverActive.svg";
import AssistantActiveIcon from "@/app/icons/assistantActive.svg";
import GitHubIcon from "@/app/icons/githubIcon.svg";
import SettingIcon from "@/app/icons/settingActive.svg";
import DiscoverInactiveIcon from "@/app/icons/discoverInactive.svg";
import AssistantInactiveIcon from "@/app/icons/assistantInactive.svg";
import SettingInactiveIcon from "@/app/icons/settingInactive.svg";
import SettingMobileActive from "@/app/icons/settingMobileActive.svg";
import DiscoverMobileActive from "@/app/icons/discoverMobileActive.svg";
import AssistantMobileActive from "@/app/icons/assistantMobileActive.svg";
import AssistantMobileInactive from "@/app/icons/assistantMobileInactive.svg";

import { useAppConfig } from "@/app/store";
import { Path, REPO_URL } from "@/app/constant";
import { useNavigate, useLocation } from "react-router-dom";
import dynamic from "next/dynamic";
import useHotKey from "@/app/hooks/useHotKey";
import useDragSideBar from "@/app/hooks/useDragSideBar";
import useMobileScreen from "@/app/hooks/useMobileScreen";
import MenuWrapper from "./MenuWrapper";
import ActionsBar from "@/app/components/ActionsBar";

const SessionList = MenuWrapper(
  dynamic(async () => await import("./SessionList"), {
    loading: () => null,
  }),
);

const SettingList = MenuWrapper(
  dynamic(async () => await import("./SettingList"), {
    loading: () => null,
  }),
);

export function SideBar(props: { className?: string }) {
  // drag side bar
  const { onDragStart } = useDragSideBar();

  const navigate = useNavigate();
  const loc = useLocation();

  const config = useAppConfig();
  const isMobileScreen = useMobileScreen();

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

  let containerClassName = "relative flex h-[100%] w-[100%]";
  let tabActionsClassName = "2xl:px-5 xl:px-4 px-2 py-6";
  let menuClassName =
    "max-md:px-4 max-md:pb-4 rounded-md my-2.5 bg-gray-50 flex-1";

  if (isMobileScreen) {
    containerClassName = "flex flex-col-reverse w-[100%] h-[100%]";
    tabActionsClassName = "bg-gray-100 rounded-tl-md rounded-tr-md h-mobile";
    menuClassName = `flex-1 px-4`;
  }

  return (
    <div className={`${containerClassName}`}>
      <ActionsBar
        inMobile={isMobileScreen}
        actionsShema={[
          {
            id: Path.Masks,
            icons: {
              active: <DiscoverIcon />,
              inactive: <DiscoverInactiveIcon />,
              mobileActive: <DiscoverMobileActive />,
              mobileInactive: <DiscoverInactiveIcon />,
            },
            title: "Discover",
          },
          {
            id: Path.Chat,
            icons: {
              active: <AssistantActiveIcon />,
              inactive: <AssistantInactiveIcon />,
              mobileActive: <AssistantMobileActive />,
              mobileInactive: <AssistantMobileInactive />,
            },
            title: "Assistant",
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
              mobileActive: <SettingMobileActive />,
              mobileInactive: <SettingInactiveIcon />,
            },
            className: "p-2",
            title: "Settrings",
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
        groups={{
          normal: [
            [Path.Chat, Path.Masks],
            ["github", Path.Settings],
          ],
          mobile: [[Path.Chat, Path.Masks, Path.Settings]],
        }}
        selected={selectedTab}
        className={`${
          isMobileScreen ? "justify-around" : "flex-col"
        } ${tabActionsClassName}`}
      />

      <SessionList
        show={selectedTab === Path.Chat}
        wrapperClassName={menuClassName}
      />
      <SettingList
        show={selectedTab === Path.Settings}
        wrapperClassName={menuClassName}
      />

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
