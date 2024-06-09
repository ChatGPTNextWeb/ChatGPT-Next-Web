import * as React from "react";

export type ButtonType = "primary" | "danger" | null;

export interface BtnProps {
  onClick?: () => void;
  icon?: JSX.Element;
  prefixIcon?: JSX.Element;
  type?: ButtonType;
  text?: React.ReactNode;
  bordered?: boolean;
  shadow?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  tabIndex?: number;
  autoFocus?: boolean;
}

export default function Btn(props: BtnProps) {
  const {
    onClick,
    icon,
    type,
    text,
    className,
    title,
    disabled,
    tabIndex,
    autoFocus,
    prefixIcon,
  } = props;

  let btnClassName;

  switch (type) {
    case "primary":
      btnClassName = `${
        disabled
          ? "bg-primary-btn-disabled dark:opacity-30 dark:text-primary-btn-disabled-dark"
          : "bg-primary-btn shadow-btn"
      } text-text-btn-primary `;
      break;
    case "danger":
      btnClassName = `bg-danger-btn text-text-btn-danger hover:bg-hovered-danger-btn`;
      break;
    default:
      btnClassName = `bg-default-btn text-text-btn-default hover:bg-hovered-btn`;
  }

  return (
    <button
      className={`
        ${className ?? ""} 
        py-2 px-3 flex items-center justify-center gap-1 rounded-action-btn transition-all duration-300 select-none
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${btnClassName} 
        follow-parent-svg
      `}
      onClick={onClick}
      title={title}
      disabled={disabled}
      role="button"
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {prefixIcon && (
        <div className={`flex items-center justify-center`}>{prefixIcon}</div>
      )}
      {text && (
        <div className={`font-common text-sm-title leading-4 line-clamp-1`}>
          {text}
        </div>
      )}
      {icon && <div className={`flex items-center justify-center`}>{icon}</div>}
    </button>
  );
}
