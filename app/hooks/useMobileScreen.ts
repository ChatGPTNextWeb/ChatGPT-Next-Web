import { useWindowSize } from "@/app/hooks/useWindowSize";
import { useRef } from "react";

export const MOBILE_MAX_WIDTH = 768;

export default function useMobileScreen() {
  const widthRef = useRef<number>(0);

  useWindowSize((size) => {
    widthRef.current = size.width;
  });

  const isMobile = widthRef.current <= MOBILE_MAX_WIDTH;

  return isMobile;
}
