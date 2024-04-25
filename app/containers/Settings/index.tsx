import Locale from "@/app/locales";
import MenuLayout from "@/app/components/MenuLayout";

import Panel from "./SettingPanel";

import GotoIcon from "@/app/icons/goto.svg";
import { useAppConfig } from "@/app/store";

export default MenuLayout(function SettingList(props) {
  const { setShowPanel } = props;
  const config = useAppConfig();

  const { isMobileScreen } = config;

  return (
    <div
      className={`
      px-6
      max-md:h-[100%] max-md:mx-[-1.5rem] max-md:py-6 max-md:bg-settings-menu-mobile
      md:pt-7 md:px-4
    `}
    >
      <div data-tauri-drag-region>
        <div
          className={`
            flex items-center justify-between 
            max-md:h-menu-title-mobile
            md:pb-5
          `}
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
          className={`
            p-4 font-common text-setting-items font-normal text-text-settings-menu-item-title
            border 
            border-opacity-0 rounded-md
            hover:border-opacity-100 hover:font-semibold hover:bg-settings-menu-item-selected 
            flex justify-between items-center
            max-md:bg-settings-menu-item-mobile
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
