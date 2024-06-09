import { useNavigate } from "react-router-dom";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";
import { DEFAULT_TOPIC, useChatStore } from "@/app/store/chat";

import LogIcon from "@/app/icons/logIcon.svg";
import GobackIcon from "@/app/icons/goback.svg";
import ShareIcon from "@/app/icons/shareIcon.svg";
import ModelSelect from "./ModelSelect";

export interface ChatHeaderProps {
  isMobileScreen: boolean;
  setIsEditingMessage: (v: boolean) => void;
  setShowExport: (v: boolean) => void;
}

export default function ChatHeader(props: ChatHeaderProps) {
  const { isMobileScreen, setIsEditingMessage, setShowExport } = props;

  const navigate = useNavigate();

  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  return (
    <div
      className={`
        absolute w-[100%] backdrop-blur-[30px] z-20 flex flex-0 justify-between items-center px-6 py-4 gap-chat-header-gap 
        sm:border-b sm:border-chat-header-bottom 
        max-md:h-menu-title-mobile
      `}
      data-tauri-drag-region
    >
      <div
        className={`absolute z-[-1] top-0 left-0 w-[100%] h-[100%] opacity-85 backdrop-blur-[20px]  sm:bg-chat-panel-header-mask bg-chat-panel-header-mobile flex flex-0 justify-between items-center  gap-chat-header-gap`}
      >
        {" "}
      </div>

      {isMobileScreen ? (
        <div
          className=" cursor-pointer follow-parent-svg default-icon-color"
          onClick={() => navigate(Path.Home)}
        >
          <GobackIcon />
        </div>
      ) : (
        <LogIcon />
      )}

      <div
        className={`
        flex-1 
        max-md:flex max-md:flex-col max-md:items-center max-md:justify-center max-md:gap-0.5 max-md:text
        md:mr-4
      `}
      >
        <div
          className={`
            line-clamp-1 cursor-pointer text-text-chat-header-title text-chat-header-title font-common 
            max-md:text-sm-title max-md:h-chat-header-title-mobile max-md:leading-5
          `}
          onClickCapture={() => setIsEditingMessage(true)}
        >
          {!session.topic ? DEFAULT_TOPIC : session.topic}
        </div>
        <div
          className={`
            text-text-chat-header-subtitle text-sm 
            max-md:text-sm-mobile-tab max-md:leading-4
          `}
        >
          {isMobileScreen ? (
            <ModelSelect />
          ) : (
            Locale.Chat.SubTitle(session.messages.length)
          )}
        </div>
      </div>

      <div
        className=" cursor-pointer hover:bg-hovered-btn p-1.5 rounded-action-btn follow-parent-svg default-icon-color"
        onClick={() => {
          setShowExport(true);
        }}
      >
        <ShareIcon />
      </div>
    </div>
  );
}
