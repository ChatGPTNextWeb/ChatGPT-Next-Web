import React from "react";
import classNames from "classnames";

interface SpeechGPTIconProps {
  className?: string;
  strokeWidth?: string;
}

const SpeechGPTIcon: React.FC<SpeechGPTIconProps> = ({
  className,
  strokeWidth,
}) => {
  return (
    <svg
      width="393"
      height="316"
      viewBox="0 0 393 316"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={classNames("", className)}
    >
      <path
        d="M0 92.5C0 77.8645 11.8645 66 26.5 66C41.1355 66 53 77.8645 53 92.5V223.5C53 238.136 41.1355 250 26.5 250C11.8645 250 0 238.136 0 223.5V92.5Z"
        fill="url(#paint0_linear_1_37)"
      />
      <path
        d="M255 114.5C255 99.8645 266.864 88 281.5 88C296.136 88 308 99.8645 308 114.5V201.5C308 216.136 296.136 228 281.5 228C266.864 228 255 216.136 255 201.5V114.5Z"
        fill="url(#paint1_linear_1_37)"
      />
      <path
        d="M85 26.5C85 11.8645 96.8645 0 111.5 0C126.136 0 138 11.8645 138 26.5V289.5C138 304.136 126.136 316 111.5 316C96.8645 316 85 304.136 85 289.5V26.5Z"
        fill="url(#paint2_linear_1_37)"
      />
      <path
        d="M170 70.5C170 55.8644 181.864 44 196.5 44C211.136 44 223 55.8645 223 70.5V245.5C223 260.136 211.136 272 196.5 272C181.864 272 170 260.136 170 245.5V70.5Z"
        fill="url(#paint3_linear_1_37)"
      />
      <path
        d="M340 157.5C340 142.864 351.864 131 366.5 131C381.136 131 393 142.864 393 157.5C393 172.136 381.136 184 366.5 184C351.864 184 340 172.136 340 157.5Z"
        fill="url(#paint4_linear_1_37)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1_37"
          x1="393"
          y1="158"
          x2="9.38324e-06"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0416667" stopColor="#EC4899" />
          <stop offset="0.498667" stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1_37"
          x1="393"
          y1="158"
          x2="9.38324e-06"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0416667" stopColor="#EC4899" />
          <stop offset="0.498667" stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1_37"
          x1="393"
          y1="158"
          x2="9.38324e-06"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0416667" stopColor="#EC4899" />
          <stop offset="0.498667" stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_1_37"
          x1="393"
          y1="158"
          x2="9.38324e-06"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0416667" stopColor="#EC4899" />
          <stop offset="0.498667" stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_1_37"
          x1="393"
          y1="158"
          x2="9.38324e-06"
          y2="158"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.0416667" stopColor="#EC4899" />
          <stop offset="0.498667" stopColor="#A855F7" />
          <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default SpeechGPTIcon;
