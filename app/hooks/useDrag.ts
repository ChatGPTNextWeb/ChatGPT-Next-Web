import { RefObject, useRef } from "react";

export default function useDrag(options: {
  customDragMove: (nextWidth: number, start?: number) => void;
  customToggle: () => void;
  customLimit?: (x: number, start?: number) => number;
  customDragEnd?: (nextWidth: number, start?: number) => void;
}) {
  const { customDragMove, customToggle, customLimit, customDragEnd } =
    options || {};
  const limit = customLimit;

  const startX = useRef(0);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = customToggle;

  const onDragMove = customDragMove;

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit?.(d, startX.current) ?? d;

      onDragMove(nextWidth, startX.current);
    };

    const handleDragEnd = (e: MouseEvent) => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      } else {
        const d = e.clientX - startX.current;
        const nextWidth = limit?.(d, startX.current) ?? d;
        customDragEnd?.(nextWidth, startX.current);
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  return {
    onDragStart,
  };
}
