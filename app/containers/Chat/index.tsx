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
import { useRef, useEffect, useMemo, useContext } from "react";
import { showConfirm } from "@/app/components/ui-lib";

import AddIcon from "@/app/icons/addIcon.svg";
import NextChatTitle from "@/app/icons/nextchatTitle.svg";
// import { ListHoodProps } from "@/app/containers/types";
import { getTime } from "@/app/utils";
import DeleteIcon from "@/app/icons/deleteIcon.svg";
import LogIcon from "@/app/icons/logIcon.svg";

import MenuLayout, {
  MenuWrapperInspectProps,
} from "@/app/components/MenuLayout";
import Panel from "./ChatPanel";

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
          className={`group relative flex p-3 items-center gap-2 self-stretch rounded-md mb-2 ${
            props.selected &&
            (currentPath === Path.Chat || currentPath === Path.Home)
              ? `bg-chat-menu-session-selected border-chat-menu-session-selected border `
              : `bg-chat-menu-session-unselected hover:bg-chat-menu-session-hovered`
          }`}
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
                className={`text-text-chat-menu-item-time text-sm group-hover:opacity-0 pl-3`}
              >
                {getTime(props.time)}
              </div>
            </div>
            <div className={`text-text-chat-menu-item-description text-sm`}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
          </div>

          <div
            className={`absolute top-[50%] translate-y-[-50%] right-3 pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100`}
            onClickCapture={(e) => {
              props.onDelete?.();
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <DeleteIcon />
          </div>
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

  let layoutClassName = "flex flex-col  px-0";
  let titleClassName = "py-7";

  if (isMobileScreen) {
    layoutClassName = "flex flex-col  pb-chat-panel-mobile ";
    titleClassName = "py-6 box-content h-0";
  }

  return (
    <div className={`h-[100%] ${layoutClassName}`}>
      <div data-tauri-drag-region>
        <div
          className={`flex items-center justify-between ${titleClassName}`}
          data-tauri-drag-region
        >
          <div className="">
            <NextChatTitle />
          </div>
          <div
            className=""
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
        className={`flex-1 overflow-y-auto overflow-x-hidden`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
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
                        !isMobileScreen ||
                        (await showConfirm(Locale.Home.DeleteChat))
                      ) {
                        chatStore.deleteSession(i);
                      }
                    }}
                    mask={item.mask}
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
