import { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children?: ReactNode;
  title?: ReactNode;
  inMobile?: boolean;
}

export default function Card(props: CardProps) {
  const { className, children, title, inMobile } = props;

  let titleClassName = "ml-4 mb-3";
  if (inMobile) {
    titleClassName = "ml-3 mb-3";
  }

  return (
    <>
      {title && (
        <div
          className={`capitalize font-black font-setting-card-title text-sm-mobile font-weight-setting-card-title  ${titleClassName}`}
        >
          {title}
        </div>
      )}
      <div className={`px-4 py-1 rounded-lg bg-card ${className}`}>
        {children}
      </div>
    </>
  );
}
