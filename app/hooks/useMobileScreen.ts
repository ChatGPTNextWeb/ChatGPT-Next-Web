import { useLayoutEffect } from "react";
import { useWindowSize } from "../utils";

export const MOBILE_MAX_WIDTH = 600;

export default function useMobileScreen() {
  const { width } = useWindowSize();

  const isMobile = width <= MOBILE_MAX_WIDTH;

  return isMobile;
}
