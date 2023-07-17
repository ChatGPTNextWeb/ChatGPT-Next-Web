import React from "react";
import classNames from "classnames";

interface SpinnerIconProps {
  className?: string;
  strokeWidth?: string;
}

const SpinnerIcon: React.FC<SpinnerIconProps> = ({
  className,
  strokeWidth,
}) => {
  return (
    <svg
      className={classNames("", className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth || "0.4"}
      stroke="currentColor"
      fill="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g>
        <path
          fill="currentColor"
          d="M12 22C6.49 22 2 17.51 2 12c0-1.87.52-3.69 1.5-5.27a1.003 1.003 0 0 1 1.7 1.06A8.008 8.008 0 0 0 4 12c0 4.41 3.59 8 8 8s8-3.59 8-8-3.59-8-8-8c-.55 0-1-.45-1-1s.45-1 1-1c5.51 0 10 4.49 10 10s-4.49 10-10 10z"
          data-original="#000000"
        />
      </g>
    </svg>
  );
};

export default SpinnerIcon;
