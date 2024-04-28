import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useAppConfig, useChatStore } from "@/app/store";

import Locale from "@/app/locales";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "@/app/constant";
import { Mask } from "@/app/store/mask";
import { useRef, useEffect } from "react";

import AddIcon from "@/app/icons/addIcon.svg";
import NextChatTitle from "@/app/icons/nextchatTitle.svg";
import DeleteChatIcon from "@/app/icons/deleteChatIcon.svg";

import { getTime } from "@/app/utils";
import DeleteIcon from "@/app/icons/deleteIcon.svg";
import LogIcon from "@/app/icons/logIcon.svg";

import MenuLayout from "@/app/components/MenuLayout";
import Panel from "./ChatPanel";
import Confirm from "@/app/components/Confirm";
import HoverPopover from "@/app/components/HoverPopover";

export function SessionItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: string;
  index: number;
  narrow?: boolean;
  mask: Mask;
  isMobileScreen: boolean;
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (props.selected && draggableRef.current) {
      draggableRef.current?.scrollIntoView({
        block: "center",
      });
    }
  }, [props.selected]);

  const { pathname: currentPath } = useLocation();

  return (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`
            group/chat-menu-list relative flex p-3 items-center gap-2 self-stretch rounded-md mb-2 
            border 
            bg-chat-menu-session-unselected border-chat-menu-session-unselected
            ${
              props.selected &&
              (currentPath === Path.Chat || currentPath === Path.Home)
                ? `!bg-chat-menu-session-selected !border-chat-menu-session-selected`
                : `hover:bg-chat-menu-session-hovered hover:chat-menu-session-hovered`
            }
          `}
          onClick={props.onClick}
          ref={(ele) => {
            draggableRef.current = ele;
            provided.innerRef(ele);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          title={`${props.title}\n${Locale.ChatItem.ChatItemCount(
            props.count,
          )}`}
        >
          <div className=" flex-shrink-0">
            <LogIcon />
          </div>
          <div className="flex flex-col flex-1">
            <div className={`flex justify-between items-center`}>
              <div
                className={` text-text-chat-menu-item-title text-sm-title line-clamp-1 flex-1`}
              >
                {props.title}
              </div>
              <div
                className={`text-text-chat-menu-item-time text-sm group-hover/chat-menu-list:opacity-0 pl-3`}
              >
                {getTime(props.time)}
              </div>
            </div>
            <div className={`text-text-chat-menu-item-description text-sm`}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
          </div>
          <HoverPopover
            content={
              <div
                className={`flex items-center gap-3 p-3 rounded-action-btn leading-6 cursor-pointer`}
                onClickCapture={(e) => {
                  props.onDelete?.();
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <DeleteChatIcon />
                <div className="flex-1 font-common text-actions-popover-menu-item">
                  {Locale.Chat.Actions.Delete}
                </div>
              </div>
            }
            popoverClassName={`
              px-2 py-1 border-delete-chat-popover bg-delete-chat-popover-panel rounded-md shadow-delete-chat-popover-shadow 
            `}
            noArrow
            align={props.isMobileScreen ? "end" : "start"}
          >
            <div
              className={` pointer-events-none opacity-0 group-hover/chat-menu-list:pointer-events-auto group-hover/chat-menu-list:opacity-100`}
            >
              <DeleteIcon />
            </div>
          </HoverPopover>
        </div>
      )}
    </Draggable>
  );
}

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

      <div
        className={`flex-1 overflow-y-auto max-md:pb-chat-panel-mobile `}
        // onClick={(e) => {
        //   if (e.target === e.currentTarget) {
        //     navigate(Path.Home);
        //   }
        // }}
      >
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
                        await Confirm.show({
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
