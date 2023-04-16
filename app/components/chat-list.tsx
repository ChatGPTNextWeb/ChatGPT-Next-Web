import DeleteIcon from "../icons/delete.svg";
import styles from "./home.module.scss";
import BotIcon from "../icons/bot.svg";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../store";

import Locale from "../locales";
import { isMobileScreen } from "../utils";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: number;
  index: number;
}) {
  const [sidebarCollapse] = useChatStore((state) => [state.sidebarCollapse]);
  return sidebarCollapse ? (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles["chat-item-collapse"]} ${
            props.selected && styles["chat-item-selected"]
          }`}
          onClick={props.onClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={styles["chat-item-info-collapse"]}>
            {Locale.ChatItem.ChatItemCount(props.count).replace(/[^0-9]/g, "")
              .length <= 3
              ? Locale.ChatItem.ChatItemCount(props.count).replace(
                  /[^0-9]/g,
                  "",
                )
              : ":)"}
          </div>
          <div
            className={styles["chat-item-delete-collapse"]}
            onClick={props.onDelete}
          >
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  ) : (
    <Draggable draggableId={`${props.id}`} index={props.index}>
      {(provided) => (
        <div
          className={`${styles["chat-item"]} ${
            props.selected && styles["chat-item-selected"]
          }`}
          onClick={props.onClick}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className={styles["chat-item-title"]}>{props.title}</div>
          <div className={styles["chat-item-info"]}>
            <div className={styles["chat-item-count"]}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
            <div className={styles["chat-item-date"]}>{props.time}</div>
          </div>
          <div className={styles["chat-item-delete"]} onClick={props.onDelete}>
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ChatList() {
  const [
    sidebarCollapse,
    sessions,
    selectedIndex,
    selectSession,
    removeSession,
    moveSession,
  ] = useChatStore((state) => [
    state.sidebarCollapse,
    state.sessions,
    state.currentSessionIndex,
    state.selectSession,
    state.removeSession,
    state.moveSession,
  ]);
  const chatStore = useChatStore();

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
    <>
      {sidebarCollapse && (
        <div className={styles["gpt-logo-collapse"]}>
          <BotIcon />
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="chat-list">
          {(provided: any) => (
            <div
              className={styles["chat-list"]}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {sessions.map((item, i) => (
                <ChatItem
                  title={item.topic}
                  time={item.lastUpdate}
                  count={item.messages.length}
                  key={item.id}
                  id={item.id}
                  index={i}
                  selected={i === selectedIndex}
                  onClick={() => selectSession(i)}
                  onDelete={chatStore.deleteSession}
                />
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
}
