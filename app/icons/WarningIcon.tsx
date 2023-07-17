import React from "react";
import classNames from "classnames";

interface WarningIconProps {
  className?: string;
  strokeWidth?: string;
}

const WarningIcon: React.FC<WarningIconProps> = ({
  className,
  strokeWidth,
}) => {
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
      <path stroke="none" d="M0 0h24v24H0z" /> <path d="M12 9v2m0 4v.01" />{" "}
      <path d="M5.07 19H19a2 2 0 0 0 1.75 -2.75L13.75 4a2 2 0 0 0 -3.5 0L3.25 16.25a2 2 0 0 0 1.75 2.75" />
    </svg>
  );
};

export default WarningIcon;
