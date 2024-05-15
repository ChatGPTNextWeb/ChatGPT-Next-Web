import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  SIDEBAR_ID,
  WINDOW_WIDTH_MD,
} from "@/app/constant";

export function updateGlobalCSSVars(nextSidebar: number) {
  const windowSize = window.innerWidth;
  const inMobile = windowSize <= WINDOW_WIDTH_MD;

  nextSidebar = Math.max(
    MIN_SIDEBAR_WIDTH,
    Math.min(MAX_SIDEBAR_WIDTH, nextSidebar),
  );

  const menuWidth = inMobile ? 0 : nextSidebar;
  const navigateBarWidth = inMobile
    ? 0
    : document.querySelector(`#${SIDEBAR_ID}`)?.clientWidth ?? 0;
  const chatPanelWidth = windowSize - navigateBarWidth - menuWidth;

  document.documentElement.style.setProperty("--menu-width", `${menuWidth}px`);
  document.documentElement.style.setProperty(
    "--navigate-bar-width",
    `${navigateBarWidth}px`,
  );
  document.documentElement.style.setProperty(
    "--chat-panel-max-width",
    `${chatPanelWidth}px`,
  );

  return { menuWidth };
}

let count = 0;

export function getUid() {
  return count++;
}
