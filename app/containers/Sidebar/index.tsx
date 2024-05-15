import GitHubIcon from "@/app/icons/githubIcon.svg";
import DiscoverIcon from "@/app/icons/discoverActive.svg";
import DiscoverInactiveIcon from "@/app/icons/discoverInactive.svg";
import DiscoverMobileActive from "@/app/icons/discoverMobileActive.svg";
import DiscoverMobileInactive from "@/app/icons/discoverMobileInactive.svg";
import SettingIcon from "@/app/icons/settingActive.svg";
import SettingInactiveIcon from "@/app/icons/settingInactive.svg";
import SettingMobileActive from "@/app/icons/settingMobileActive.svg";
import SettingMobileInactive from "@/app/icons/settingMobileInactive.svg";
import AssistantActiveIcon from "@/app/icons/assistantActive.svg";
import AssistantInactiveIcon from "@/app/icons/assistantInactive.svg";
import AssistantMobileActive from "@/app/icons/assistantMobileActive.svg";
import AssistantMobileInactive from "@/app/icons/assistantMobileInactive.svg";

import { useAppConfig } from "@/app/store";
import { Path, REPO_URL } from "@/app/constant";
import { useNavigate, useLocation } from "react-router-dom";
import useHotKey from "@/app/hooks/useHotKey";
import ActionsBar from "@/app/components/ActionsBar";

export function SideBar(props: { className?: string }) {
  const navigate = useNavigate();
  const loc = useLocation();

  const config = useAppConfig();
  const { isMobileScreen } = config;

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
      selectedTab = Path.Home;
  }

  return (
    <div
      className={`
      flex h-[100%]
      max-md:flex-col-reverse max-md:w-[100%]
      md:relative 
    `}
    >
      <ActionsBar
        inMobile={isMobileScreen}
        actionsSchema={[
          {
            id: Path.Masks,
            icons: {
              active: <DiscoverIcon />,
              inactive: <DiscoverInactiveIcon />,
              mobileActive: <DiscoverMobileActive />,
              mobileInactive: <DiscoverMobileInactive />,
            },
            title: "Discover",
            activeClassName: "shadow-sidebar-btn-shadow",
            className: "mb-4 hover:bg-sidebar-btn-hovered",
          },
          {
            id: Path.Home,
            icons: {
              active: <AssistantActiveIcon />,
              inactive: <AssistantInactiveIcon />,
              mobileActive: <AssistantMobileActive />,
              mobileInactive: <AssistantMobileInactive />,
            },
            title: "Assistant",
            activeClassName: "shadow-sidebar-btn-shadow",
            className: "mb-4 hover:bg-sidebar-btn-hovered",
          },
          {
            id: "github",
            icons: <GitHubIcon />,
            className: "!p-2 mb-3 hover:bg-sidebar-btn-hovered",
          },
          {
            id: Path.Settings,
            icons: {
              active: <SettingIcon />,
              inactive: <SettingInactiveIcon />,
              mobileActive: <SettingMobileActive />,
              mobileInactive: <SettingMobileInactive />,
            },
            className: "!p-2 hover:bg-sidebar-btn-hovered",
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
            [Path.Home, Path.Masks],
            ["github", Path.Settings],
          ],
          mobile: [[Path.Home, Path.Masks, Path.Settings]],
        }}
        selected={selectedTab}
        className={`
        max-md:bg-sidebar-mobile  max-md:h-mobile max-md:justify-around
        2xl:px-5 xl:px-4 md:px-2 md:py-6 md:flex-col
        `}
      />
    </div>
  );
}
