import React from "react";
import classNames from "classnames";

interface XIconProps {
  className?: string;
  strokeWidth?: string;
}

const XIcon: React.FC<XIconProps> = ({ className, strokeWidth }) => {
  return (
    <svg
      className={classNames("", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || "2"}
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export default XIcon;
