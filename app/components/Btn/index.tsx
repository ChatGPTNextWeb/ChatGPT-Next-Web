import * as React from "react";

export type ButtonType = "primary" | "danger" | null;

export default function IconButton(props: {
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
  } = props;

  return (
    <button
      className={`
        ${className ?? ""} 
        py-2 px-3 flex items-center justify-center gap-1 rounded-action-btn shadow-btn transition-all duration-300 select-none
        ${
          type === "primary"
            ? `${disabled ? "bg-blue-300" : "bg-blue-600"}`
            : `${disabled ? "bg-gray-100" : "bg-gray-300"}`
        } 
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${type === "primary" ? `text-white` : `text-gray-500`} 
      `}
      onClick={onClick}
      title={title}
      disabled={disabled}
      role="button"
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {text && (
        <div className={`text-common text-sm-title leading-4 line-clamp-1`}>
          {text}
        </div>
      )}
      {icon && <div className={`flex items-center justify-center`}>{icon}</div>}
    </button>
  );
}
