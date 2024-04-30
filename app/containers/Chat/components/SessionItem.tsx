import { Draggable } from "@hello-pangea/dnd";

import Locale from "@/app/locales";
import { useLocation } from "react-router-dom";
import { Path } from "@/app/constant";
import { Mask } from "@/app/store/mask";
import { useRef, useEffect } from "react";

import DeleteChatIcon from "@/app/icons/deleteChatIcon.svg";

import { getTime } from "@/app/utils";
import DeleteIcon from "@/app/icons/deleteIcon.svg";
import LogIcon from "@/app/icons/logIcon.svg";

import HoverPopover from "@/app/components/HoverPopover";

export default function SessionItem(props: {
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
              bg-chat-menu-session-unselected border-chat-menu-session-unselected cursor-pointer
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
              className={`
                  !absolute top-[50%] translate-y-[-50%] right-3 pointer-events-none opacity-0 
                  group-hover/chat-menu-list:pointer-events-auto 
                  group-hover/chat-menu-list:opacity-100
                  hover:bg-select-hover rounded-chat-img
                `}
            >
              <DeleteIcon />
            </div>
          </HoverPopover>
        </div>
      )}
    </Draggable>
  );
}
