import * as React from "react";

import styles from "./button.module.css";

export function IconButton(props: {
  onClick?: () => void;
  icon: JSX.Element;
  text?: string;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.className ?? ""}`
      }
      onClick={props.onClick}
    >
      <div className={styles["icon-button-icon"]}>{props.icon}</div>
      {props.text && (
        <div className={styles["icon-button-text"]}>{props.text}</div>
      )}
    </div>
  );
}
