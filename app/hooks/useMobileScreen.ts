import { useWindowSize } from "@/app/hooks/useWindowSize";

export const MOBILE_MAX_WIDTH = 768;

export default function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}
