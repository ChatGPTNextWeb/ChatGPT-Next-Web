import useRelativePosition from "@/app/hooks/useRelativePosition";
import {
  RefObject,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const ArrowIcon = ({ sibling }: { sibling: RefObject<HTMLDivElement> }) => {
  const [color, setColor] = useState<string>("");
  useEffect(() => {
    if (sibling.current) {
      const { backgroundColor } = window.getComputedStyle(sibling.current);
      setColor(backgroundColor);
    }
  }, []);

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
  popoverRoot.style.zIndex = "10000";
  popoverRoot.id = "popover-root";
}

export interface PopoverProps {
  content?: JSX.Element | string;
  children?: JSX.Element;
  show?: boolean;
  onShow?: (v: boolean) => void;
  className?: string;
  popoverClassName?: string;
  trigger?: "hover" | "click";
  placement?: "t" | "lt" | "rt" | "lb" | "rb" | "b" | "l" | "r";
  noArrow?: boolean;
  delayClose?: number;
  useGlobalRoot?: boolean;
  getPopoverPanelRef?: (ref: RefObject<HTMLDivElement>) => void;
}

export default function Popover(props: PopoverProps) {
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
    delayClose = 0,
    useGlobalRoot,
    getPopoverPanelRef,
  } = props;

  const [internalShow, setShow] = useState(false);
  const { position, getRelativePosition } = useRelativePosition({
    delay: 0,
  });

  const popoverCommonClass = `absolute p-2 box-border`;

  const mergedShow = show ?? internalShow;

  const { arrowClassName, placementStyle, placementClassName } = useMemo(() => {
    const arrowCommonClassName = `${
      noArrow ? "hidden" : ""
    } absolute z-10 left-[50%] translate-x-[calc(-50%)]`;

    let defaultTopPlacement = true; // when users dont config 't' or 'b'

    const {
      distanceToBottomBoundary = 0,
      distanceToLeftBoundary = 0,
      distanceToRightBoundary = -10000,
      distanceToTopBoundary = 0,
      targetH = 0,
      targetW = 0,
    } = position?.poi || {};

    if (distanceToBottomBoundary > distanceToTopBoundary) {
      defaultTopPlacement = false;
    }

    const placements = {
      lt: {
        placementStyle: {
          bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
          left: `calc(${distanceToLeftBoundary}px - ${targetW * 0.02}px)`,
        },
        arrowClassName: `${arrowCommonClassName} bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)] pb-[0.5rem]`,
        placementClassName: "bottom-[calc(100%+0.5rem)] left-[calc(-2%)]",
      },
      lb: {
        placementStyle: {
          top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
          left: `calc(${distanceToLeftBoundary}px - ${targetW * 0.02}px)`,
        },
        arrowClassName: `${arrowCommonClassName} top-[calc(100%+0.5rem)] translate-y-[calc(-100%)]  pt-[0.5rem]`,
        placementClassName: "top-[calc(100%+0.5rem)] left-[calc(-2%)]",
      },
      rt: {
        placementStyle: {
          bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
          right: `calc(${distanceToRightBoundary}px - ${targetW * 0.02}px)`,
        },
        arrowClassName: `${arrowCommonClassName} bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)] pb-[0.5rem]`,
        placementClassName: "bottom-[calc(100%+0.5rem)] right-[calc(-2%)]",
      },
      rb: {
        placementStyle: {
          top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
          right: `calc(${distanceToRightBoundary}px - ${targetW * 0.02}px)`,
        },
        arrowClassName: `${arrowCommonClassName} top-[calc(100%+0.5rem)] translate-y-[calc(-100%)] pt-[0.5rem]`,
        placementClassName: "top-[calc(100%+0.5rem)] right-[calc(-2%)]",
      },
      t: {
        placementStyle: {
          bottom: `calc(${distanceToBottomBoundary + targetH}px + 0.5rem)`,
          left: `calc(${distanceToLeftBoundary + targetW / 2}px`,
          transform: "translateX(-50%)",
        },
        arrowClassName: `${arrowCommonClassName} bottom-[calc(100%+0.5rem)] translate-y-[calc(100%)] pb-[0.5rem]`,
        placementClassName:
          "bottom-[calc(100%+0.5rem)] left-[50%] translate-x-[calc(-50%)]",
      },
      b: {
        placementStyle: {
          top: `calc(-${distanceToBottomBoundary}px + 0.5rem)`,
          left: `calc(${distanceToLeftBoundary + targetW / 2}px`,
          transform: "translateX(-50%)",
        },
        arrowClassName: `${arrowCommonClassName} top-[calc(100%+0.5rem)] translate-y-[calc(-100%)] pt-[0.5rem]`,
        placementClassName:
          "top-[calc(100%+0.5rem)] left-[50%]  translate-x-[calc(-50%)]",
      },
    };

    const getStyle = () => {
      if (["l", "r"].includes(placement)) {
        return placements[
          `${placement}${defaultTopPlacement ? "t" : "b"}` as
            | "lt"
            | "lb"
            | "rb"
            | "rt"
        ];
      }
      return placements[placement as Exclude<typeof placement, "l" | "r">];
    };

    return getStyle();
  }, [Object.values(position?.poi || {})]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(0);

  useLayoutEffect(() => {
    getPopoverPanelRef?.(popoverRef);
    onShow?.(internalShow);
  }, [internalShow]);

  if (trigger === "click") {
    const handleOpen = (e: { currentTarget: any }) => {
      clearTimeout(closeTimer.current);
      setShow(true);
      getRelativePosition(e.currentTarget, "");
      window.document.documentElement.style.overflow = "hidden";
    };
    const handleClose = () => {
      if (delayClose) {
        closeTimer.current = window.setTimeout(() => {
          setShow(false);
        }, delayClose);
      } else {
        setShow(false);
      }
      window.document.documentElement.style.overflow = "auto";
    };

    return (
      <div
        className={`relative ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!mergedShow) {
            handleOpen(e);
          } else {
            handleClose();
          }
        }}
      >
        {children}
        {mergedShow && (
          <>
            {!noArrow && (
              <div className={`${arrowClassName}`}>
                <ArrowIcon sibling={popoverRef} />
              </div>
            )}
            {createPortal(
              <div
                className={`${popoverCommonClass} ${popoverClassName} cursor-pointer overflow-auto`}
                style={{ zIndex: baseZIndex + 1, ...placementStyle }}
                ref={popoverRef}
              >
                {content}
              </div>,
              popoverRoot,
            )}
            {createPortal(
              <div
                className=" fixed w-[100vw] h-[100vh] right-0 bottom-0"
                style={{ zIndex: baseZIndex }}
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
              >
                &nbsp;
              </div>,
              popoverRoot,
            )}
          </>
        )}
      </div>
    );
  }

  if (useGlobalRoot) {
    return (
      <div
        className={`relative ${className}`}
        onPointerEnter={(e) => {
          e.preventDefault();
          clearTimeout(closeTimer.current);
          onShow?.(true);
          setShow(true);
          getRelativePosition(e.currentTarget, "");
          window.document.documentElement.style.overflow = "hidden";
        }}
        onPointerLeave={(e) => {
          e.preventDefault();
          if (delayClose) {
            closeTimer.current = window.setTimeout(() => {
              onShow?.(false);
              setShow(false);
            }, delayClose);
          } else {
            onShow?.(false);
            setShow(false);
          }
          window.document.documentElement.style.overflow = "auto";
        }}
      >
        {children}
        {mergedShow && (
          <>
            <div
              className={`${
                noArrow ? "opacity-0" : ""
              } bg-inherit ${arrowClassName}`}
              style={{ zIndex: baseZIndex + 1 }}
            >
              <ArrowIcon sibling={popoverRef} />
            </div>
            {createPortal(
              <div
                className={` whitespace-nowrap ${popoverCommonClass} ${popoverClassName} cursor-pointer`}
                style={{ zIndex: baseZIndex + 1, ...placementStyle }}
                ref={popoverRef}
              >
                {content}
              </div>,
              popoverRoot,
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group/popover relative ${className}`}
      onPointerEnter={(e) => {
        getRelativePosition(e.currentTarget, "");
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {children}
      <div
        className={`
          hidden group-hover/popover:block 
          ${noArrow ? "opacity-0" : ""} 
          bg-inherit 
          ${arrowClassName}
        `}
        style={{ zIndex: baseZIndex + 1 }}
      >
        <ArrowIcon sibling={popoverRef} />
      </div>
      <div
        className={`
          hidden group-hover/popover:block whitespace-nowrap 
          ${popoverCommonClass} 
          ${placementClassName} 
          ${popoverClassName}
        `}
        ref={popoverRef}
        style={{ zIndex: baseZIndex + 1 }}
      >
        {content}
      </div>
    </div>
  );
}
