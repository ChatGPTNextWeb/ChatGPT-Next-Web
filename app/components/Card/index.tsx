import { ReactNode } from "react";

export interface CardProps {
  className?: string;
  children?: ReactNode;
  title?: ReactNode;
}

export default function Card(props: CardProps) {
  const { className, children, title } = props;

  return (
    <>
      {title && (
        <div
          className={`
            capitalize !font-semibold text-sm-mobile font-weight-setting-card-title text-text-card-title
            mb-3

            ml-3
            md:ml-4  
          `}
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
