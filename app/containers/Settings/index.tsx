"use client";
import Locale from "@/app/locales";
import MenuLayout from "@/app/components/MenuLayout";

import Panel from "./SettingPanel";

import GotoIcon from "@/app/icons/goto.svg";
import { useAppConfig } from "@/app/store";
import { useEffect, useState } from "react";

export const list = [
  {
    id: Locale.Settings.GeneralSettings,
    title: Locale.Settings.GeneralSettings,
    icon: null,
  },
  {
    id: Locale.Settings.ModelSettings,
    title: Locale.Settings.ModelSettings,
    icon: null,
  },
  {
    id: Locale.Settings.DataSettings,
    title: Locale.Settings.DataSettings,
    icon: null,
  },
];

export default MenuLayout(function SettingList(props) {
  const { setShowPanel, setExternalProps } = props;
  const config = useAppConfig();

  const { isMobileScreen } = config;

  const [selected, setSelected] = useState(list[0].id);

  useEffect(() => {
    setExternalProps?.(list[0]);
  }, []);

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
          <div className="text-setting-title text-text-settings-menu-title font-common !font-bold">
            {Locale.Settings.Title}
          </div>
        </div>
      </div>

      <div
        className={`flex flex-col gap-2 overflow-y-auto overflow-x-hidden w-[100%]`}
      >
        {list.map((i) => (
          <div
            key={i.id}
            className={`
              p-4 font-common text-setting-items font-normal text-text-settings-menu-item-title
              cursor-pointer
              border 
              rounded-md
              border-transparent
              ${
                selected === i.id && !isMobileScreen
                  ? `!bg-chat-menu-session-selected !border-chat-menu-session-selected !font-medium`
                  : `hover:bg-chat-menu-session-unselected hover:border-chat-menu-session-unselected`
              }

              flex justify-between items-center
              max-md:bg-settings-menu-item-mobile
            `}
            onClick={() => {
              setShowPanel?.(true);
              setExternalProps?.(i);
              setSelected(i.id);
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
