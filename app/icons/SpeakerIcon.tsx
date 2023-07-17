import React from "react";
import classNames from "classnames";

interface SpeakerIconProps {
  className?: string;
  strokeWidth?: string;
}

const SpeakerIcon: React.FC<SpeakerIconProps> = ({
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
      <path d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
};

export default SpeakerIcon;
