import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/app/constant";
import { useAppConfig } from "@/app/store/config";
import { useRef } from "react";
import { updateGlobalCSSVars } from "@/app/utils/client";

export default function useDragSideBar() {
  const limit = (x: number) =>
    Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, x));

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  const lastUpdateTime = useRef(Date.now());

  const toggleSideBar = () => {
    config.update((config) => {
      config.sidebarWidth = DEFAULT_SIDEBAR_WIDTH;
    });
  };

  const onDragStart = (e: MouseEvent) => {
    // Remembers the initial width each time the mouse is pressed
    startX.current = e.clientX;
    startDragWidth.current = config.sidebarWidth;
    const dragStartTime = Date.now();

    const handleDragMove = (e: MouseEvent) => {
      if (Date.now() < lastUpdateTime.current + 20) {
        return;
      }
      lastUpdateTime.current = Date.now();
      const d = e.clientX - startX.current;
      const nextWidth = limit(startDragWidth.current + d);

      const { menuWidth } = updateGlobalCSSVars(nextWidth);

      document.documentElement.style.setProperty(
        "--menu-width",
        `${menuWidth}px`,
      );
      config.update((config) => {
        config.sidebarWidth = nextWidth;
      });
    };

    const handleDragEnd = () => {
      // In useRef the data is non-responsive, so `config.sidebarWidth` can't get the dynamic sidebarWidth
      window.removeEventListener("pointermove", handleDragMove);
      window.removeEventListener("pointerup", handleDragEnd);

      // if user click the drag icon, should toggle the sidebar
      const shouldFireClick = Date.now() - dragStartTime < 300;
      if (shouldFireClick) {
        toggleSideBar();
      }
    };

    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  // useLayoutEffect(() => {
  //   const barWidth = limit(config.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH);
  //   document.documentElement.style.setProperty("--menu-width", `${barWidth}px`);
  // }, [config.sidebarWidth]);

  return {
    onDragStart,
  };
}
