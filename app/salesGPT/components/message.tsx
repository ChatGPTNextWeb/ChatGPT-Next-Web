import MessageActions from "./messageActions";
import styles from "./message.module.scss";

function Message(props: { title?: string; message: string }) {
  return (
    <div className={styles["chat-message-container"]}>
      <div className={styles["chat-message-header"]}>
        {props.title && <span>{props.title}</span>}
        <MessageActions message={props.message} />
      </div>
      <div className={styles["content"]}>
        <p className={styles["text"]}>{props.message}</p>
      </div>
    </div>
  );
}

export default Message;
