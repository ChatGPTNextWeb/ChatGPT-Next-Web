import React, { useRef, useState } from "react";
import Locale from "../../locales";
import { copyToClipboard } from "@/app/utils";

import CopyIcon from "../../icons/copy.svg";
import ResetIcon from "../../icons/reload.svg";
import DeleteIcon from "../../icons/clear.svg";
import PinIcon from "../../icons/pin.svg";

import styles from "./message.module.scss";

export default function MessageActions(props: {
  message: string;
  retryAction?: () => void;
  deleteAction?: () => void;
  pinAction?: () => void;
}) {
  const showActions = true;
  return (
    <div className={styles["chat-message-header"]}>
      {showActions && (
        <div className={styles["chat-message-actions"]}>
          <div className={styles["chat-input-actions"]}>
            {props.retryAction && (
              <MessageAction
                text={Locale.Chat.Actions.Retry}
                icon={<ResetIcon />}
                onClick={props.retryAction}
              />
            )}

            {props.deleteAction && (
              <MessageAction
                text={Locale.Chat.Actions.Delete}
                icon={<DeleteIcon />}
                onClick={props.deleteAction}
              />
            )}

            {props.pinAction && (
              <MessageAction
                text={Locale.Chat.Actions.Pin}
                icon={<PinIcon />}
                onClick={props.pinAction}
              />
            )}

            <MessageAction
              text={Locale.Chat.Actions.Copy}
              icon={<CopyIcon />}
              onClick={() => copyToClipboard(props.message)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MessageAction(props: {
  text: string;
  icon: JSX.Element;
  onClick: () => void;
}) {
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState({
    full: 16,
    icon: 16,
  });

  function updateWidth() {
    if (!iconRef.current || !textRef.current) return;
    const getWidth = (dom: HTMLDivElement) => dom.getBoundingClientRect().width;
    const textWidth = getWidth(textRef.current);
    const iconWidth = getWidth(iconRef.current);
    setWidth({
      full: textWidth + iconWidth,
      icon: iconWidth,
    });
  }

  return (
    <div
      className={`${styles["chat-input-action"]} clickable`}
      onClick={() => {
        props.onClick();
        setTimeout(updateWidth, 1);
      }}
      onMouseEnter={updateWidth}
      onTouchStart={updateWidth}
      style={
        {
          "--icon-width": `${width.icon}px`,
          "--full-width": `${width.full}px`,
        } as React.CSSProperties
      }
    >
      <div ref={iconRef} className={styles["icon"]}>
        {props.icon}
      </div>
      <div className={styles["text"]} ref={textRef}>
        {props.text}
      </div>
    </div>
  );
}
