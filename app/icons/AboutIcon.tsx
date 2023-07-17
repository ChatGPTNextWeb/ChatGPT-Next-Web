import React from "react";
import classNames from "classnames";

interface AboutIconProps {
  className?: string;
  strokeWidth?: string;
}

const AboutIcon: React.FC<AboutIconProps> = ({ className, strokeWidth }) => {
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
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export default AboutIcon;
