import React from "react";
import classNames from "classnames";

interface RightTriangleIconProps {
  className?: string;
  strokeWidth?: string;
}

const RightTriangleIcon: React.FC<RightTriangleIconProps> = ({
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
      <path d="M18 15l-6-6l-6 6h12" transform="rotate(90 12 12)" />
    </svg>
  );
};

export default RightTriangleIcon;
