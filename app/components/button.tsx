import * as React from "react";

import styles from "./button.module.scss";

export type ButtonType = "primary" | "danger" | null;

import LoadingIcon from "../icons/three-dots-white.svg";

export function IconButton(props: {
  onClick?: () => void;
  icon?: JSX.Element;
  type?: ButtonType;
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
  loding?: boolean;
}) {
  return (
    <button
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable ${styles[props.type ?? ""]}`
      }
      onClick={props.onClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
      tabIndex={props.tabIndex}
      autoFocus={props.autoFocus}
    >
      {props.icon && !props.loding && (
        <div
          className={
            styles["icon-button-icon"] +
            ` ${props.type === "primary" && "no-dark"}`
          }
        >
          {props.icon}
        </div>
      )}

      {props.text && !props.loding && (
        <div className={styles["icon-button-text"]}>{props.text}</div>
      )}
      {props.loding ? (
        <div
          className={
            styles["icon-button-loading-icon"] +
            ` ${props.type === "primary" && "no-dark"}`
          }
        >
          <LoadingIcon />
        </div>
      ) : null}
    </button>
  );
}
