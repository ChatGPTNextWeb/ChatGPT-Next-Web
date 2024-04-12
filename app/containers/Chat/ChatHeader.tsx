import { useNavigate } from "react-router-dom";
import { IconButton } from "@/app/components/button";
import Locale from "@/app/locales";
import { Path } from "@/app/constant";
import { DEFAULT_TOPIC, useChatStore } from "@/app/store/chat";

import RenameIcon from "@/app/icons/rename.svg";
import ExportIcon from "@/app/icons/share.svg";
import ReturnIcon from "@/app/icons/return.svg";

import styles from "./index.module.scss";

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
    <div className="window-header" data-tauri-drag-region>
      {isMobileScreen && (
        <div className="window-actions">
          <div className={"window-action-button"}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={Locale.Chat.Actions.ChatList}
              onClick={() => navigate(Path.Home)}
            />
          </div>
        </div>
      )}

      <div className={`window-header-title ${styles["chat-body-title"]}`}>
        <div
          className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          onClickCapture={() => setIsEditingMessage(true)}
        >
          {!session.topic ? DEFAULT_TOPIC : session.topic}
        </div>
        <div className="window-header-sub-title">
          {Locale.Chat.SubTitle(session.messages.length)}
        </div>
      </div>
      <div className="window-actions">
        {!isMobileScreen && (
          <div className="window-action-button">
            <IconButton
              icon={<RenameIcon />}
              bordered
              onClick={() => setIsEditingMessage(true)}
            />
          </div>
        )}
        <div className="window-action-button">
          <IconButton
            icon={<ExportIcon />}
            bordered
            title={Locale.Chat.Actions.Export}
            onClick={() => {
              setShowExport(true);
            }}
          />
        </div>
      </div>
    </div>
  );
}
