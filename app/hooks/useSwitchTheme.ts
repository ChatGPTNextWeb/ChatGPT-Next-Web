import { useLayoutEffect } from "react";
import { Theme, useAppConfig } from "@/app/store/config";

const DARK_CLASS = "dark-new";
const LIGHT_CLASS = "light-new";

export function useSwitchTheme() {
  const config = useAppConfig();

  useLayoutEffect(() => {
    document.body.classList.remove(DARK_CLASS);
    document.body.classList.remove(LIGHT_CLASS);

    if (config.theme === Theme.Dark) {
      document.body.classList.add(DARK_CLASS);
    } else {
      document.body.classList.add(LIGHT_CLASS);
    }
  }, [config.theme]);
}
