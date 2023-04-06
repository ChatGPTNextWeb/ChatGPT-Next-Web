import { create } from "zustand";
import { isMobileScreen } from "../utils";

interface Screen {
  isMobile: boolean;
  update: () => void;
}

export const useScreen = create<Screen>(set => {
  const state = {
    isMobile: isMobileScreen(),
    update: () => set({ isMobile: isMobileScreen() }),
  };
  if (typeof window !== "undefined") {
    window.addEventListener("resize", e => {
      state.update();
    });
  }
  return state;
});
