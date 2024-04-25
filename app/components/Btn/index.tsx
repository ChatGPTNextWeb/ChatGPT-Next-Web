import * as React from "react";

export type ButtonType = "primary" | "danger" | null;

export default function Btn(props: {
  onClick?: () => void;
  icon?: JSX.Element;
  type?: ButtonType;
  text?: React.ReactNode;
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
    className,
    title,
    disabled,
    tabIndex,
    autoFocus,
  } = props;

  let btnClassName;

  switch (type) {
    case "primary":
      btnClassName = `${
        disabled ? "bg-primary-btn-disabled" : "bg-primary-btn shadow-btn"
      } text-text-btn-primary `;
      break;
    case "danger":
      btnClassName = `bg-danger-btn text-text-btn-danger`;
      break;
    default:
      btnClassName = `bg-default-btn text-text-btn-default`;
  }

  return (
    <button
      className={`
        ${className ?? ""} 
        py-2 px-3 flex items-center justify-center gap-1 rounded-action-btn transition-all duration-300 select-none
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${btnClassName} 
      `}
      onClick={onClick}
      title={title}
      disabled={disabled}
      role="button"
      tabIndex={tabIndex}
      autoFocus={autoFocus}
    >
      {text && (
        <div className={`font-common text-sm-title leading-4 line-clamp-1`}>
          {text}
        </div>
      )}
      {icon && <div className={`flex items-center justify-center`}>{icon}</div>}
    </button>
  );
}
