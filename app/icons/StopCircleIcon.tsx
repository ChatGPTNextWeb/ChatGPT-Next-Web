import React from "react";
import classNames from "classnames";

interface StopCircleIconProps {
  className?: string;
  strokeWidth?: string;
}

const StopCircleIcon: React.FC<StopCircleIconProps> = ({
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
      <circle cx="12" cy="12" r="10" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
};

export default StopCircleIcon;
