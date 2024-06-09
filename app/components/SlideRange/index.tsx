import { useContext, useEffect, useRef } from "react";
import { ListContext } from "@/app/components/List";
import { useResizeObserver } from "usehooks-ts";

interface SlideRangeProps {
  className?: string;
  description?: string;
  range?: {
    start?: number;
    stroke?: number;
  };
  onSlide?: (v: number) => void;
  value?: number;
  step?: number;
}

const margin = 15;

export default function SlideRange(props: SlideRangeProps) {
  const {
    className = "",
    description = "",
    range = {},
    value,
    onSlide,
    step,
  } = props;
  const { start = 0, stroke = 1 } = range;

  const { rangeClassName, update } = useContext(ListContext);

  const slideRef = useRef<HTMLDivElement>(null);

  useResizeObserver({
    ref: slideRef,
    onResize: () => {
      setProperty(value);
    },
  });

  const transformToWidth = (x: number = start) => {
    const abs = x - start;
    const maxWidth = (slideRef.current?.clientWidth || 1) - margin * 2;
    const result = (abs / stroke) * maxWidth;
    return result;
  };

  const setProperty = (value?: number) => {
    const initWidth = transformToWidth(value);
    slideRef.current?.style.setProperty(
      "--slide-value-size",
      `${initWidth + margin}px`,
    );
  };

  useEffect(() => {
    update?.({ type: "range" });
  }, []);

  return (
    <div
      className={`flex flex-col justify-center items-end gap-1 w-[100%] ${className} ${rangeClassName}`}
    >
      {!!description && (
        <div className=" text-common text-sm ">{description}</div>
      )}
      <div
        className="flex my-1.5 relative w-[100%] h-1.5 bg-slider rounded-slide cursor-pointer"
        ref={slideRef}
      >
        <div className="cursor-pointer absolute  marker:top-0 h-[100%] w-[var(--slide-value-size)]  bg-slider-slided-travel rounded-slide">
          &nbsp;
        </div>
        <div
          className="cursor-pointer absolute z-1 w-[30px] top-[50%] translate-y-[-50%] left-[var(--slide-value-size)] translate-x-[-50%]  h-slide-btn leading-slide-btn text-sm-mobile text-center rounded-slide border border-slider-block bg-slider-block hover:bg-slider-block-hover text-text-slider-block"
          // onPointerDown={onPointerDown}
        >
          {value}
        </div>
        <input
          type="range"
          className="w-[100%] h-[100%] opacity-0 cursor-pointer"
          value={value}
          min={start}
          max={start + stroke}
          step={step}
          onChange={(e) => {
            setProperty(e.target.valueAsNumber);
            onSlide?.(e.target.valueAsNumber);
          }}
          style={{
            marginLeft: margin,
            marginRight: margin,
          }}
        />
      </div>
    </div>
  );
}
