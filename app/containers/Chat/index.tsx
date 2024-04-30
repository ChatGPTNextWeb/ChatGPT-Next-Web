import {
  DragDropContext,
  Droppable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useAppConfig, useChatStore } from "@/app/store";

import Locale from "@/app/locales";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import { useEffect } from "react";

import AddIcon from "@/app/icons/addIcon.svg";
import NextChatTitle from "@/app/icons/nextchatTitle.svg";

import MenuLayout from "@/app/components/MenuLayout";
import Panel from "./ChatPanel";
import Modal from "@/app/components/Modal";
import SessionItem from "./components/SessionItem";

export default MenuLayout(function SessionList(props) {
  const { setShowPanel } = props;

  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );
  const navigate = useNavigate();
  const config = useAppConfig();

  const { isMobileScreen } = config;

  const chatStore = useChatStore();
  const { pathname: currentPath } = useLocation();

  useEffect(() => {
    setShowPanel?.(currentPath === Path.Chat);
  }, [currentPath]);

  const onDragEnd: OnDragEndResponder = (result) => {
    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    moveSession(source.index, destination.index);
  };

  return (
    <div
      className={`
      h-[100%] flex flex-col
      md:px-0
    `}
    >
      <div data-tauri-drag-region>
        <div
          className={`
            flex items-center justify-between
            py-6 max-md:box-content max-md:h-0
            md:py-7
          `}
          data-tauri-drag-region
        >
          <div className="">
            <NextChatTitle />
          </div>
          <div
            className=" cursor-pointer"
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
          >
            <AddIcon />
          </div>
        </div>
        <div
          className={`pb-3 text-sm sm:text-sm-mobile text-text-chat-header-subtitle`}
        >
          Build your own AI assistant.
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto max-md:pb-chat-panel-mobile `}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chat-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`w-[100%]`}
              >
                {sessions.map((item, i) => (
                  <SessionItem
                    title={item.topic}
                    time={new Date(item.lastUpdate).toLocaleString()}
                    count={item.messages.length}
                    key={item.id}
                    id={item.id}
                    index={i}
                    selected={i === selectedIndex}
                    onClick={() => {
                      navigate(Path.Chat);
                      selectSession(i);
                    }}
                    onDelete={async () => {
                      if (
                        await Modal.warn({
                          okText: Locale.ChatItem.DeleteOkBtn,
                          cancelText: Locale.ChatItem.DeleteCancelBtn,
                          title: Locale.ChatItem.DeleteTitle,
                          content: Locale.ChatItem.DeleteContent,
                        })
                      ) {
                        chatStore.deleteSession(i);
                      }
                    }}
                    mask={item.mask}
                    isMobileScreen={isMobileScreen}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}, Panel);
