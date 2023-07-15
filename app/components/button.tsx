import * as React from "react";

import styles from "./button.module.scss";

export function IconButton(props: {
  onClick?: (() => void) | ((value: boolean) => void);
  icon?: JSX.Element;
  type?: "primary" | "danger";
  text?: string;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
}) {
  const handleClick = () => {
    if (props.onClick) {
      if (typeof props.onClick === "function") {
        (props.onClick as () => void)(); // 调用无参函数
      } else {
        (props.onClick as (value: boolean) => void)(true); // 调用带布尔参数的函数
      }
    }
  };

  return (
    <button
      className={
        styles["icon-button"] +
        ` ${props.bordered && styles.border} ${props.shadow && styles.shadow} ${
          props.className ?? ""
        } clickable ${styles[props.type ?? ""]}`
      }
      onClick={handleClick}
      title={props.title}
      disabled={props.disabled}
      role="button"
    >
      {props.icon && (
        <div
          className={
            styles["icon-button-icon"] +
            ` ${props.type === "primary" && "no-dark"}`
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
