import { useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import Locale from "@/app/locales";
import GobackIcon from "@/app/icons/goback.svg";

export interface ChatHeaderProps {
  isMobileScreen: boolean;
  goback: () => void;
}

export default function SettingHeader(props: ChatHeaderProps) {
  const { isMobileScreen, goback } = props;

  const navigate = useNavigate();

  let containerClassName = "";
  let titleClassName = "mr-4";
  let mainTitleClassName = "";
  let subTitleClassName = "";

  if (isMobileScreen) {
    containerClassName = "h-menu-title-mobile";
    titleClassName = "flex flex-col items-center justify-center gap-0.5 text";
    mainTitleClassName = "text-sm-title h-[19px] leading-5";
    subTitleClassName = "text-sm-mobile-tab leading-4";
  }

  return (
    <div
      className={`relative flex flex-0 justify-between items-center px-6 py-4 gap-chat-header-gap border-b-[1px] border-gray-200 ${containerClassName}`}
      data-tauri-drag-region
    >
      {isMobileScreen ? (
        <div
          className="absolute left-4 top-[50%] translate-y-[-50%]"
          onClick={() => goback()}
        >
          <GobackIcon />
        </div>
      ) : null}

      <div className={`flex-1 ${titleClassName}`}>
        <div
          className={`line-clamp-1 cursor-pointer text-black text-chat-header-title font-common ${mainTitleClassName}`}
        >
          {Locale.Settings.Title}
        </div>
      </div>
    </div>
  );
}
