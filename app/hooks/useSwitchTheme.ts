import { useLayoutEffect } from "react";
import { Theme, useAppConfig } from "@/app/store/config";
import { getCSSVar } from "../utils";

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

  useLayoutEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}
