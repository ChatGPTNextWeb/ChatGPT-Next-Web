import DeleteIcon from "../icons/delete.svg";
import styles from "./home.module.scss";
import { useChatStore } from "../store";
import Locale from "../locales";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { MaskAvatar } from "./mask";
import { Mask } from "../store/mask";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: number;
  index: number;
  narrow?: boolean;
  mask: Mask;
}) {
  return (
    <div
      className={`${styles["chat-item"]} ${
        props.selected && styles["chat-item-selected"]
      }`}
      onClick={props.onClick}
      title={`${props.title}\n${Locale.ChatItem.ChatItemCount(props.count)}`}
    >
      {props.narrow ? (
        <div className={styles["chat-item-narrow"]}>
          <div className={styles["chat-item-avatar"] + " no-dark"}>
            <MaskAvatar mask={props.mask} />
          </div>
          <div className={styles["chat-item-narrow-count"]}>{props.count}</div>
        </div>
      ) : (
        <>
          <div className={styles["chat-item-title"]}>{props.title}</div>
          <div className={styles["chat-item-info"]}>
            <div className={styles["chat-item-count"]}>
              {Locale.ChatItem.ChatItemCount(props.count)}
            </div>
            <div className={styles["chat-item-date"]}>
              {new Date(props.time).toLocaleString()}
            </div>
          </div>
        </>
      )}
      <div
        className={styles["chat-item-delete"]}
        onClickCapture={props.onDelete}
      >
        <DeleteIcon />
      </div>
    </div>
  );
}

export function ChatList(props: { narrow?: boolean }) {
  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );
  const chatStore = useChatStore();
  const navigate = useNavigate();
  return (
    <div className={styles["chat-list"]}>
      {sessions.map((item, i) => (
        <ChatItem
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
          onDelete={() => {
            if (!props.narrow || confirm(Locale.Home.DeleteChat)) {
              chatStore.deleteSession(i);
            }
          }}
          narrow={props.narrow}
          mask={item.mask}
        />
      ))}
    </div>
  );
}
