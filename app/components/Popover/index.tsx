import { useState } from "react";

export default function Popover(props: {
  content?: JSX.Element | string;
  children?: JSX.Element;
  show?: boolean;
  onShow?: (v: boolean) => void;
  className?: string;
  popoverClassName?: string;
  trigger?: "hover" | "click";
  placement?: "t" | "lt" | "rt" | "lb" | "rb" | "b";
  noArrow?: boolean;
}) {
  const {
    content,
    children,
    show,
    onShow,
    className,
    popoverClassName,
    trigger = "hover",
    placement = "t",
    noArrow = false,
  } = props;

  const [internalShow, setShow] = useState(false);

  const mergedShow = show ?? internalShow;

  let placementClassName;
  let arrowClassName =
    "rotate-45 w-[8.5px] h-[8.5px] left-[50%] translate-x-[calc(-50%)] bg-black rounded-[1px] ";

  switch (placement) {
    case "b":
      placementClassName =
        "bottom-[calc(-100%-0.5rem)] left-[50%] translate-x-[calc(-50%)]";
      arrowClassName += "bottom-[-5px] ";
      break;
    // case 'l':
    //     placementClassName = '';
    //     break;
    // case 'r':
    //     placementClassName = '';
    //     break;
    case "rb":
      placementClassName = "bottom-[calc(-100%-0.5rem)]";
      arrowClassName += "bottom-[-5px] ";
      break;
    case "lt":
      placementClassName =
        "top-[calc(-100%-0.5rem)] left-[100%] translate-x-[calc(-100%)]";
      arrowClassName += "top-[-5px] ";
      break;
    case "lb":
      placementClassName =
        "bottom-[calc(-100%-0.5rem)] left-[100%] translate-x-[calc(-100%)]";
      arrowClassName += "bottom-[-5px] ";
      break;
    case "rt":
      placementClassName = "top-[calc(-100%-0.5rem)]";
      arrowClassName += "top-[-5px] ";
      break;
    case "t":
    default:
      placementClassName =
        "top-[calc(-100%-0.5rem)] left-[50%] translate-x-[calc(-50%)]";
      arrowClassName += "top-[-5px] ";
  }

  const popoverCommonClass = "absolute p-2 box-border";

  if (noArrow) {
    arrowClassName = "hidden";
  }

  if (trigger === "click") {
    return (
      <div
        className={`relative ${className}`}
        onClick={(e) => {
          e.preventDefault();
          onShow?.(!mergedShow);
          setShow(!mergedShow);
        }}
      >
        {children}
        {mergedShow && (
          <>
            {!noArrow && (
              <div className={`absolute ${arrowClassName}`}>&nbsp;</div>
            )}
            <div
              className={`${popoverCommonClass} ${placementClassName} ${popoverClassName}`}
            >
              {content}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      {children}
      {!noArrow && (
        <div className={`hidden group-hover:block absolute ${arrowClassName}`}>
          &nbsp;
        </div>
      )}
      <div
        className={`hidden group-hover:block ${popoverCommonClass} ${placementClassName} ${popoverClassName}`}
      >
        {content}
      </div>
    </div>
  );
}
