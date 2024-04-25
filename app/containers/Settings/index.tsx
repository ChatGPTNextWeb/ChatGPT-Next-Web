import Locale from "@/app/locales";
import MenuLayout from "@/app/components/MenuLayout";

import Panel from "./SettingPanel";

import GotoIcon from "@/app/icons/goto.svg";
import { useAppConfig } from "@/app/store";

export default MenuLayout(function SettingList(props) {
  const { setShowPanel } = props;
  const config = useAppConfig();

  const { isMobileScreen } = config;

  let layoutClassName = "pt-7 px-4";
  let titleClassName = "pb-5";
  let itemClassName = "";

  if (isMobileScreen) {
    layoutClassName = "h-[100%] mx-[-1.5rem] px-6 py-6 bg-settings-menu-mobile";
    titleClassName = "h-menu-title-mobile";
    itemClassName = "p-4 bg-settings-menu-item-mobile";
  }

  return (
    <div className={` ${layoutClassName}`}>
      <div data-tauri-drag-region>
        <div
          className={`flex items-center justify-between ${titleClassName}`}
          data-tauri-drag-region
        >
          <div className="text-setting-title text-text-settings-menu-title font-common font-setting-title">
            {Locale.Settings.Title}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col overflow-y-auto overflow-x-hidden w-[100%]`}
      >
        <div
          className={`p-4 font-common text-setting-items font-normal text-text-settings-menu-item-title
                border border-settings-menu-item-selected border-opacity-0 rounded-md
                hover:border-opacity-100 hover:font-semibold hover:bg-settings-menu-item-selected ${itemClassName}
                flex justify-between items-center
            `}
          onClick={() => {
            setShowPanel?.(true);
          }}
        >
          {Locale.Settings.GeneralSettings}
          {isMobileScreen && <GotoIcon />}
        </div>
      </div>
    </div>
  );
}, Panel);
