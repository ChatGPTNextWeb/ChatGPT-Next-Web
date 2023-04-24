import * as React from "react";

import styles from "./button.module.scss";

export function IconButton(props: {
  onClick?: () => void;
  icon?: JSX.Element;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  noDark?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable`
      }
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
    >
      {props.icon && (
        <div
          className={
            styles["icon-button-icon"] + ` ${props.noDark && "no-dark"}`
          }
        >
          {props.icon}
        </div>
      )}

      {props.text && (
        <div className={styles["icon-button-text"]}>{props.text}</div>
      )}
    </button>
  );
}
