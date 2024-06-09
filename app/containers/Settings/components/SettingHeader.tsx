import Locale from "@/app/locales";
import GobackIcon from "@/app/icons/goback.svg";

export interface ChatHeaderProps {
  isMobileScreen: boolean;
  goback: () => void;
}

export default function SettingHeader(props: ChatHeaderProps) {
  const { isMobileScreen, goback } = props;

  return (
    <div
      className={`
        relative flex flex-0 justify-between items-center px-6 py-4 gap-chat-header-gap border-b border-settings-header 
        max-md:h-menu-title-mobile max-md:bg-settings-header-mobile
      `}
      data-tauri-drag-region
    >
      {isMobileScreen ? (
        <div
          className="absolute left-4 top-[50%] translate-y-[-50%] cursor-pointer"
          onClick={() => goback()}
        >
          <GobackIcon />
        </div>
      ) : null}

      <div
        className={`
        flex-1 
        max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-0.5 max-md:text
        md:mr-4
      `}
      >
        <div
          className={`
          line-clamp-1 cursor-pointer text-text-settings-panel-header-title text-chat-header-title font-common 
          max-md:text-sm-title max-md:h-chat-header-title-mobile max-md:leading-5 !font-medium
          `}
        >
          {Locale.Settings.Title}
        </div>
      </div>
    </div>
  );
}
