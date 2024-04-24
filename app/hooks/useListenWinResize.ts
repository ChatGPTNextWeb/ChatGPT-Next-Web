import { useWindowSize } from "@/app/hooks/useWindowSize";
import {
  WINDOW_WIDTH_2XL,
  WINDOW_WIDTH_LG,
  WINDOW_WIDTH_MD,
  WINDOW_WIDTH_SM,
  WINDOW_WIDTH_XL,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
} from "@/app/constant";
import { useAppConfig } from "@/app/store/config";
import { updateGlobalCSSVars } from "@/app/utils/client";

export const MOBILE_MAX_WIDTH = 768;

const widths = [
  WINDOW_WIDTH_2XL,
  WINDOW_WIDTH_XL,
  WINDOW_WIDTH_LG,
  WINDOW_WIDTH_MD,
  WINDOW_WIDTH_SM,
];

export default function useListenWinResize() {
  const config = useAppConfig();

  useWindowSize((size) => {
    let nextSidebar = config.sidebarWidth;
    if (!nextSidebar) {
      switch (widths.find((w) => w < size.width)) {
        case WINDOW_WIDTH_2XL:
          nextSidebar = MAX_SIDEBAR_WIDTH;
          break;
        case WINDOW_WIDTH_XL:
        case WINDOW_WIDTH_LG:
          nextSidebar = DEFAULT_SIDEBAR_WIDTH;
          break;
        case WINDOW_WIDTH_MD:
        case WINDOW_WIDTH_SM:
        default:
          nextSidebar = MIN_SIDEBAR_WIDTH;
      }
    }

    const { menuWidth } = updateGlobalCSSVars(nextSidebar);

    config.update((config) => {
      config.sidebarWidth = menuWidth;
    });
    config.update((config) => {
      config.isMobileScreen = size.width <= MOBILE_MAX_WIDTH;
    });
  });
}
