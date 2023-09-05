import * as React from "react";

import styles from "./button.module.scss";

export type ButtonType = "primary" | "danger" |  null;

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
  importData?: () => void; // Add importData prop
  confirmDialogVisible?: boolean; // Add confirmDialogVisible prop
}) {
  const {
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
    importData, // Destructure importData prop
    confirmDialogVisible, // Destructure confirmDialogVisible prop
  } = props;

  const handleClick = () => {
    if (confirmDialogVisible) {
      // Handle confirm dialog logic here
    } else if (importData) {
      importData();
    } else if (onClick) {
      onClick();
    }
  };
  

  return (
    <button
      className={
        styles["icon-button"] +
        ` ${bordered && styles.border} ${shadow && styles.shadow} ${
          className ?? ""
        } clickable ${styles[type ?? ""]}`
      }
      onClick={handleClick}
      title={title}
      disabled={disabled}
      role="button"
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {icon && (
        <div
          className={
            styles["icon-button-icon"] +
            ` ${type === "primary" && "no-dark"}`
          }
        >
          {icon}
        </div>
      )}

      {text && <div className={styles["icon-button-text"]}>{text}</div>}
    </button>
  );
}
