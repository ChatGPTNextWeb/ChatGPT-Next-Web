import { getCSSVar } from "@/app/utils";
import { useMemo, useState } from "react";

const ArrowIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="6"
      viewBox="0 0 16 6"
      fill="none"
    >
      <path
        d="M16 0H0C1.28058 0 2.50871 0.508709 3.41421 1.41421L6.91 4.91C7.51199 5.51199 8.48801 5.51199 9.09 4.91L12.5858 1.41421C13.4913 0.508708 14.7194 0 16 0Z"
        fill={color}
      />
    </svg>
  );
};

const baseZIndex = 100;

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
  bgcolor?: string;
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
    bgcolor,
  } = props;

  const [internalShow, setShow] = useState(false);

  const mergedShow = show ?? internalShow;

  let placementClassName;
  let arrowClassName = "absolute left-[50%] translate-x-[calc(-50%)]";
  // "absolute rotate-45 w-[8.5px] h-[8.5px] left-[50%] translate-x-[calc(-50%)] bg-black rounded-[1px] ";
  arrowClassName += " ";

  switch (placement) {
    case "b":
      placementClassName =
        "top-[calc(100%+0.5rem)] left-[50%]  translate-x-[calc(-50%)]";
      arrowClassName += "top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]";
      break;
    // case 'l':
    //     placementClassName = '';
    //     break;
    // case 'r':
    //     placementClassName = '';
    //     break;
    case "rb":
      placementClassName = "top-[calc(100%+0.5rem)] translate-x-[calc(-2%)]";
      arrowClassName += "top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]";
      break;
    case "lt":
      placementClassName =
        "bottom-[calc(100%+0.5rem)] left-[100%] translate-x-[calc(-98%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
      break;
    case "lb":
      placementClassName =
        "top-[calc(100%+0.5rem)] left-[100%] translate-x-[calc(-98%)]";
      arrowClassName += "top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]";
      break;
    case "rt":
      placementClassName = "bottom-[calc(100%+0.5rem)] translate-x-[calc(-2%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
      break;
    case "t":
    default:
      placementClassName =
        "bottom-[calc(100%+0.5rem)] left-[50%] translate-x-[calc(-50%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
  }

  const popoverCommonClass = "absolute p-2 box-border";

  if (noArrow) {
    arrowClassName = "hidden";
  }

  const internalBgColor = useMemo(() => {
    return bgcolor ?? getCSSVar("--tip-popover-color");
  }, [bgcolor]);

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
              <div className={`${arrowClassName}`}>
                <ArrowIcon color={internalBgColor} />
              </div>
            )}
            <div
              className={`${popoverCommonClass} ${placementClassName} ${popoverClassName}`}
              style={{ zIndex: baseZIndex + 1 }}
            >
              {content}
            </div>
            <div
              className=" fixed w-[100%] h-[100%] top-0 left-0 right-0 bottom-0"
              style={{ zIndex: baseZIndex }}
              onClick={(e) => {
                e.preventDefault();
                onShow?.(!mergedShow);
                setShow(!mergedShow);
              }}
            >
              &nbsp;
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
        <div className={`hidden group-hover:block ${arrowClassName}`}>
          <ArrowIcon color={internalBgColor} />
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
