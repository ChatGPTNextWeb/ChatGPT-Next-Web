import * as React from "react";

import styles from "./button.module.scss";

export type ButtonType = "primary" | "danger" | null;

interface IconButtonProps {
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
  role?:
    | "button"
    | "submit"
    | "link"
    | "menuitem"
    | "checkbox"
    | "radio"
    | "switch";
}

export function IconButton({
  onClick,
  icon,
  type,
  text,
  bordered,
  shadow,
  className,
  title,
  disabled,
  tabIndex,
  autoFocus,
  role = "button",
}: IconButtonProps) {
  return (
    <button
      className={
        styles["icon-button"] +
        ` ${bordered && styles.border} ${shadow && styles.shadow} ${
          className ?? ""
        } clickable ${styles[type ?? ""]}`
      }
      onClick={onClick}
      title={title}
      disabled={disabled}
      role={role}
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {icon && (
        <div
          className={
            styles["icon-button-icon"] + ` ${type === "primary" && "no-dark"}`
          }
        >
          {icon}
        </div>
      )}

      {text && <div className={styles["icon-button-text"]}>{text}</div>}
    </button>
  );
}
