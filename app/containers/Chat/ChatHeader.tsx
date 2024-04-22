import { useNavigate } from "react-router-dom";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";
import { DEFAULT_TOPIC, useChatStore } from "@/app/store/chat";

import LogIcon from "@/app/icons/logIcon.svg";
import GobackIcon from "@/app/icons/goback.svg";
import ShareIcon from "@/app/icons/shareIcon.svg";
import BottomArrow from "@/app/icons/bottomArrow.svg";

export interface ChatHeaderProps {
  isMobileScreen: boolean;
  setIsEditingMessage: (v: boolean) => void;
  setShowExport: (v: boolean) => void;
  showModelSelector: (v: boolean) => void;
}

export default function ChatHeader(props: ChatHeaderProps) {
  const {
    isMobileScreen,
    setIsEditingMessage,
    setShowExport,
    showModelSelector,
  } = props;

  const navigate = useNavigate();

  const chatStore = useChatStore();
  const session = chatStore.currentSession();

  const currentModel = chatStore.currentSession().mask.modelConfig.model;

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
      className={`absolute w-[100%]  backdrop-blur-[30px] z-20 flex flex-0 justify-between items-center px-6 py-4 gap-chat-header-gap border-b-[1px] border-gray-200 ${containerClassName}`}
      data-tauri-drag-region
    >
      <div
        className={`absolute z-[-1] top-0 left-0 w-[100%] h-[100%] opacity-85 backdrop-blur-[20px]  bg-gray-50 flex flex-0 justify-between items-center  gap-chat-header-gap`}
      >
        {" "}
      </div>

      {isMobileScreen ? (
        <div onClick={() => navigate(Path.Home)}>
          <GobackIcon />
        </div>
      ) : (
        <LogIcon />
      )}

      <div className={`flex-1 ${titleClassName}`}>
        <div
          className={`line-clamp-1 cursor-pointer text-black text-chat-header-title font-common ${mainTitleClassName}`}
          onClickCapture={() => setIsEditingMessage(true)}
        >
          {!session.topic ? DEFAULT_TOPIC : session.topic}
        </div>
        <div className={`text-gray-500 text-sm ${subTitleClassName}`}>
          {isMobileScreen ? (
            <div
              className="flex items-center gap-1"
              onClick={() => showModelSelector(true)}
            >
              {currentModel}
              <BottomArrow />
            </div>
          ) : (
            Locale.Chat.SubTitle(session.messages.length)
          )}
        </div>
      </div>

      <div
        onClick={() => {
          setShowExport(true);
        }}
      >
        <ShareIcon />
      </div>
    </div>
  );
}
