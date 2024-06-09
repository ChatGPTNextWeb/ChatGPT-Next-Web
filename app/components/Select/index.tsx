import SelectIcon from "@/app/icons/downArrowIcon.svg";
import Popover from "@/app/components/Popover";
import React, { useContext, useMemo, useRef } from "react";
import useRelativePosition, {
  Orientation,
} from "@/app/hooks/useRelativePosition";
import List from "@/app/components/List";

import Selected from "@/app/icons/selectedIcon.svg";

export type Option<Value> = {
  value: Value;
  label: string;
  icon?: React.ReactNode;
};

export interface SearchProps<Value> {
  value?: string;
  onSelect?: (v: Value) => void;
  options?: Option<Value>[];
  inMobile?: boolean;
}

const Select = <Value extends number | string>(props: SearchProps<Value>) => {
  const { value, onSelect, options = [], inMobile } = props;

  const { isMobileScreen, selectClassName } = useContext(List.ListContext);

  const optionsRef = useRef<Option<Value>[]>([]);
  optionsRef.current = options;
  const selectedOption = useMemo(
    () => optionsRef.current.find((o) => o.value === value),
    [value],
  );

  const contentRef = useRef<HTMLDivElement>(null);

  const { position, getRelativePosition } = useRelativePosition({
    delay: 0,
  });

  let headerH = 100;
  let baseH = position?.poi.distanceToBottomBoundary || 0;
  if (isMobileScreen) {
    headerH = 60;
  }
  if (position?.poi.relativePosition[1] === Orientation.bottom) {
    baseH = position?.poi.distanceToTopBoundary;
  }

  const maxHeight = `${baseH - headerH}px`;

  const content = (
    <div
      className={` flex flex-col gap-1 overflow-y-auto overflow-x-hidden`}
      style={{ maxHeight }}
    >
      {options?.map((o) => (
        <div
          key={o.value}
          className={`
            flex items-center px-3 py-2 gap-3 rounded-action-btn hover:bg-select-option-hovered cursor-pointer
          `}
          onClick={() => {
            onSelect?.(o.value);
          }}
        >
          <div className="flex gap-2 flex-1 follow-parent-svg text-text-select-option">
            {!!o.icon && <div className="flex items-center">{o.icon}</div>}
            <div className={`flex-1 text-text-select-option`}>{o.label}</div>
          </div>
          <div
            className={
              selectedOption?.value === o.value ? "opacity-100" : "opacity-0"
            }
          >
            <Selected />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      noArrow
      placement={
        position?.poi.relativePosition[1] !== Orientation.bottom ? "rb" : "rt"
      }
      popoverClassName="border border-select-popover rounded-lg shadow-select-popover-shadow w-actions-popover  bg-select-popover-panel"
      onShow={(e) => {
        getRelativePosition(contentRef.current!, "");
      }}
      className={selectClassName}
    >
      <div
        className={`flex items-center gap-3 py-2 px-3 bg-select rounded-action-btn font-common text-sm-title  cursor-pointer hover:bg-select-hover transition duration-300 ease-in-out`}
        ref={contentRef}
      >
        <div
          className={`flex items-center gap-2 flex-1 follow-parent-svg text-text-select`}
        >
          {!!selectedOption?.icon && (
            <div className={``}>{selectedOption?.icon}</div>
          )}
          <div className={`flex-1`}>{selectedOption?.label}</div>
        </div>
        <div className={``}>
          <SelectIcon />
        </div>
      </div>
    </Popover>
  );
};

export default Select;
