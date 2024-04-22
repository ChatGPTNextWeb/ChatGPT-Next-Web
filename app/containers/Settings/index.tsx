import Locale from "@/app/locales";
import useMobileScreen from "@/app/hooks/useMobileScreen";
import MenuLayout from "@/app/components/MenuLayout";

import Panel from "./SettingPanel";

import GotoIcon from "@/app/icons/goto.svg";

export default MenuLayout(function SettingList(props) {
  const { setShowPanel } = props;
  const isMobileScreen = useMobileScreen();

  let layoutClassName = "pt-7 px-4";
  let titleClassName = "pb-5";
  let itemClassName = "";

  if (isMobileScreen) {
    layoutClassName = "h-[100%] mx-[-1.5rem] px-6 py-6 bg-blue-50";
    titleClassName = "h-menu-title-mobile";
    itemClassName = "p-4 bg-white";
  }

  return (
    <div className={` ${layoutClassName}`}>
      <div data-tauri-drag-region>
        <div
          className={`flex items-center justify-between ${titleClassName}`}
          data-tauri-drag-region
        >
          <div className="text-setting-title text-black font-common font-setting-title">
            {Locale.Settings.Title}
          </div>
        </div>
        {/* <div className={`pb-3 text-sm sm:text-sm-mobile text-blue-500`}>
            {Locale.Settings.SubTitle}
            </div> */}
      </div>

      <div
        className={`flex flex-col overflow-y-auto overflow-x-hidden w-[100%]`}
      >
        <div
          //   className={`p-4 font-common text-setting-items font-normal text-black
          //     border-[1px] border-blue-200 border-opacity-0 rounded-md
          //   `}
          className={`p-4 font-common text-setting-items font-normal text-black
                border-[1px] border-blue-200 border-opacity-0 rounded-md
                hover:border-opacity-100 hover:bg-blue-100 ${itemClassName}
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
