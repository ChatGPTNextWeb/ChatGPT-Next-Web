import Locale from "@/app/locales";
import MenuLayout from "@/app/components/MenuLayout";

import Panel from "./SettingPanel";

import GotoIcon from "@/app/icons/goto.svg";
import { useAppConfig } from "@/app/store";
import { useState } from "react";

export default MenuLayout(function SettingList(props) {
  const { setShowPanel } = props;
  const config = useAppConfig();

  const { isMobileScreen } = config;

  const list = [
    {
      id: Locale.Settings.GeneralSettings,
      title: Locale.Settings.GeneralSettings,
      icon: null,
    },
  ];

  const [selected, setSelected] = useState(list[0].id);

  return (
    <div
      className={`
      max-md:h-[100%] max-md:mx-[-1rem] max-md:py-6 max-md:px-4 max-md:bg-settings-menu-mobile
      md:pt-7
    `}
    >
      <div data-tauri-drag-region>
        <div
          className={`
            flex items-center justify-between 
            max-md:h-menu-title-mobile
            md:pb-5 md:px-4
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
        {list.map((i) => (
          <div
            key={i.id}
            className={`
              p-4 font-common text-setting-items font-normal text-text-settings-menu-item-title
             cursor-pointer
              border 
              rounded-md

              bg-chat-menu-session-unselected border-chat-menu-session-unselected
              ${
                selected === i.id && !isMobileScreen
                  ? `!bg-chat-menu-session-selected !border-chat-menu-session-selected`
                  : `hover:bg-chat-menu-session-hovered hover:chat-menu-session-hovered`
              }

              hover:border-opacity-100 hover:font-semibold hover:bg-settings-menu-item-selected 
              flex justify-between items-center
              max-md:bg-settings-menu-item-mobile
            `}
            onClick={() => {
              setShowPanel?.(true);
            }}
          >
            {i.title}
            {i.icon}
            {isMobileScreen && <GotoIcon />}
          </div>
        ))}
      </div>
    </div>
  );
}, Panel);
