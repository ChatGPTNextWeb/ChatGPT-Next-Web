import { Theme } from "../store";
import useMediaQuery from "./dom";

export const useUserPreferredTheme = () => {
  const isLightTheme = useMediaQuery("(prefers-color-scheme: light)");

  return isLightTheme ? Theme.Light : Theme.Dark;
};
