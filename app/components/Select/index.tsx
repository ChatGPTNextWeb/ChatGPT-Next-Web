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
          className={`flex  items-center p-3 gap-2 rounded-action-btn hover:bg-select-option-hovered`}
          onClick={() => {
            onSelect?.(o.value);
          }}
        >
          {!!o.icon && <div className="">{o.icon}</div>}
          <div className={`flex-1`}>{o.label}</div>
          {selectedOption?.value === o.value && <Selected />}
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
      popoverClassName="border border-select-popover rounded-lg shadow-select-popover-shadow w-actions-popover  bg-select-popover-panel dark:bg-select-popover-panel-dark"
      onShow={(e) => {
        getRelativePosition(contentRef.current!, "");
      }}
    >
      <div
        className={`flex items-center gap-3 py-2 px-3 bg-select rounded-action-btn font-time text-sm-title ${selectClassName} cursor-pointer`}
        ref={contentRef}
      >
        <div className={`flex items-center gap-2 flex-1`}>
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
