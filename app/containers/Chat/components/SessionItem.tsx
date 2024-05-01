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
import Popover from "@/app/components/Popover";

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
              transition-colors duration-300 ease-in-out
              bg-chat-menu-session-unselected-mobile border-chat-menu-session-unselected-mobile
              md:bg-chat-menu-session-unselected md:border-chat-menu-session-unselected
              ${
                props.selected &&
                (currentPath === Path.Chat || currentPath === Path.Home)
                  ? `
                    md:!bg-chat-menu-session-selected md:!border-chat-menu-session-selected
                    !bg-chat-menu-session-selected-mobile !border-chat-menu-session-selected-mobile
                    `
                  : `md:hover:bg-chat-menu-session-hovered md:hover:chat-menu-session-hovered`
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
                className={`text-text-chat-menu-item-time text-sm group-hover/chat-menu-list:opacity-0 pl-3 hidden md:block`}
              >
                {getTime(props.time)}
              </div>
            </div>
            <div className={`text-text-chat-menu-item-description text-sm`}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
          </div>
          <div
            className={`text-text-chat-menu-item-time text-sm pl-3 block md:hidden`}
          >
            {getTime(props.time)}
          </div>
          {props.isMobileScreen ? (
            <Popover
              content={
                <div
                  className={`
                    flex items-center gap-3 p-3 rounded-action-btn leading-6 cursor-pointer
                    follow-parent-svg
                    fill-none
                    text-text-chat-menu-item-delete
                `}
                  onClickCapture={(e) => {
                    props.onDelete?.();
                  }}
                >
                  <DeleteChatIcon />
                  <div className="flex-1 font-common text-actions-popover-menu-item ">
                    {Locale.Chat.Actions.Delete}
                  </div>
                </div>
              }
              popoverClassName={`
                    px-2 py-1 border-delete-chat-popover bg-delete-chat-popover-panel rounded-md shadow-delete-chat-popover-shadow 
                `}
              noArrow
              placement="r"
            >
              <div
                className={`
                        cursor-pointer rounded-chat-img
                        md:!absolute md:top-[50%] md:translate-y-[-50%] md:right-3 md:pointer-events-none md:opacity-0 
                        md:group-hover/chat-menu-list:pointer-events-auto 
                        md:group-hover/chat-menu-list:opacity-100
                        md:hover:bg-select-hover 
                        follow-parent-svg
                        fill-none
                        text-text-chat-menu-item-time
                    `}
              >
                <DeleteIcon />
              </div>
            </Popover>
          ) : (
            <HoverPopover
              content={
                <div
                  className={`
                    flex items-center gap-3 p-3 rounded-action-btn leading-6 cursor-pointer
                    follow-parent-svg
                    fill-none
                    text-text-chat-menu-item-delete
                `}
                  onClickCapture={(e) => {
                    props.onDelete?.();
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DeleteChatIcon />
                  <div className="flex-1 font-common text-actions-popover-menu-item text-text-chat-menu-item-delete">
                    {Locale.Chat.Actions.Delete}
                  </div>
                </div>
              }
              popoverClassName={`
                    px-2 py-1 border-delete-chat-popover bg-delete-chat-popover-panel rounded-md shadow-delete-chat-popover-shadow 
                `}
              noArrow
              align="start"
            >
              <div
                className={`
                        cursor-pointer rounded-chat-img
                        md:!absolute md:top-[50%] md:translate-y-[-50%] md:right-3 md:pointer-events-none md:opacity-0 
                        md:group-hover/chat-menu-list:pointer-events-auto 
                        md:group-hover/chat-menu-list:opacity-100
                        md:hover:bg-select-hover 
                    `}
              >
                <DeleteIcon />
              </div>
            </HoverPopover>
          )}
        </div>
      )}
    </Draggable>
  );
}
