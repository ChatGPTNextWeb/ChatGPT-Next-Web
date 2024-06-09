import { useWindowSize } from "@/app/hooks/useWindowSize";
import { MOBILE_MAX_WIDTH } from "@/app/hooks/useListenWinResize";

export default function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}
