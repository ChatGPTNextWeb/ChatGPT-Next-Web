import * as React from "react";

import styles from "./button.module.scss";

export function IconButton(props: {
  onClick?: () => void;
  icon: JSX.Element;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  noDark?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable`
      }
      onClick={props.onClick}
      title={props.title}
      role="button"
    >
      <div
        className={styles["icon-button-icon"] + ` ${props.noDark && "no-dark"}`}
      >
        {props.icon}
      </div>
      {props.text && (
        <div className={styles["icon-button-text"]}>{props.text}</div>
      )}
    </div>
  );
}
