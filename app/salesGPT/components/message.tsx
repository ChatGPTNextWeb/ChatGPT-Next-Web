import MessageActions from "./messageActions";
import styles from "./message.module.scss";

function Message(props: { message: string }) {
  return (
    <div className={styles["chat-message-container"]}>
      <MessageActions message={props.message} />
      <div className={styles["content"]}>
        <p className={styles["text"]}>{props.message}</p>
      </div>
    </div>
  );
}

export default Message;
