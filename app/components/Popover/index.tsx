import useRelativePosition from "@/app/hooks/useRelativePosition";
import { getCSSVar } from "@/app/utils";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

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
const popoverRootName = "popoverRoot";
let popoverRoot = document.querySelector(
  `#${popoverRootName}`,
) as HTMLDivElement;
if (!popoverRoot) {
  popoverRoot = document.createElement("div");
  document.body.appendChild(popoverRoot);
  popoverRoot.style.height = "0px";
  popoverRoot.style.width = "100%";
  popoverRoot.style.position = "fixed";
  popoverRoot.style.bottom = "0";
  popoverRoot.style.zIndex = "100";
  popoverRoot.id = "popoverRootName";
}

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
  const { position, getRelativePosition } = useRelativePosition({
    delay: 0,
  });

  const {
    distanceToBottomBoundary = 0,
    distanceToLeftBoundary = 0,
    distanceToRightBoundary = -10000,
    distanceToTopBoundary = 0,
    targetH = 0,
    targetW = 0,
  } = position?.poi || {};

  let placementStyle: React.CSSProperties = {};
  const popoverCommonClass = `absolute p-2 box-border`;

  const mergedShow = show ?? internalShow;

  let placementClassName;
  let arrowClassName = "absolute left-[50%] translate-x-[calc(-50%)]";
  // "absolute rotate-45 w-[8.5px] h-[8.5px] left-[50%] translate-x-[calc(-50%)] bg-black rounded-[1px] ";
  arrowClassName += " ";

  switch (placement) {
    case "b":
      placementStyle = {
        top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
        left: `calc(${distanceToLeftBoundary + targetW}px - ${
          targetW * 0.02
        }px)`,
        transform: "translateX(-50%)",
      };
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
      placementStyle = {
        top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
        right: `calc(${distanceToRightBoundary}px - ${targetW * 0.02}px)`,
      };
      placementClassName = "top-[calc(100%+0.5rem)] right-[calc(-2%)]";
      arrowClassName += "top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]";
      break;
    case "rt":
      placementStyle = {
        bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
        right: `calc(${distanceToRightBoundary}px - ${targetW * 0.02}px)`,
      };
      placementClassName = "bottom-[calc(100%+0.5rem)] right-[calc(-2%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
      break;
    case "lt":
      placementStyle = {
        bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
        left: `calc(${distanceToLeftBoundary}px - ${targetW * 0.02}px)`,
      };
      placementClassName = "bottom-[calc(100%+0.5rem)] left-[calc(-2%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
      break;
    case "lb":
      placementStyle = {
        top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
        left: `calc(${distanceToLeftBoundary}px - ${targetW * 0.02}px)`,
      };
      placementClassName = "top-[calc(100%+0.5rem)] left-[calc(-2%)]";
      arrowClassName += "top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]";
      break;
    case "t":
    default:
      placementStyle = {
        bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
        left: `calc(${distanceToLeftBoundary + targetW}px - ${
          targetW * 0.02
        }px)`,
        transform: "translateX(-50%)",
      };
      placementClassName =
        "bottom-[calc(100%+0.5rem)] left-[50%] translate-x-[calc(-50%)]";
      arrowClassName += "bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)]";
  }

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
          if (!mergedShow) {
            getRelativePosition(e.currentTarget, "");
            window.document.documentElement.style.overflow = "hidden";
          } else {
            window.document.documentElement.style.overflow = "auto";
          }
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
            {createPortal(
              <div
                className={`${popoverCommonClass} ${popoverClassName}`}
                style={{ zIndex: baseZIndex + 1, ...placementStyle }}
              >
                {content}
              </div>,
              popoverRoot,
            )}
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
