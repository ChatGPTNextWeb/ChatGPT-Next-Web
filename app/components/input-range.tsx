import * as React from "react";
import styles from "./input-range.module.scss";

interface InputRangeProps {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onMouseUp?: React.MouseEventHandler<HTMLInputElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLInputElement>;
  title?: string;
  value: number | string;
  className?: string;
  min: string;
  max: string;
  step: string;
}

export function InputRange({
  onChange,
  onMouseUp,
  onTouchEnd,
  title,
  value,
  className,
  min,
  max,
  step,
}: InputRangeProps) {
  return (
    <div className={styles["input-range"] + ` ${className ?? ""}`}>
      {title || value}
      <input
        type="range"
        title={title}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
      ></input>
    </div>
  );
}
