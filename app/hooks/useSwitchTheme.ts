import { useEffect } from "react";
import { Theme, useAppConfig } from "@/app/store/config";

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("dark");

    if (config.theme === Theme.Dark) {
      document.body.classList.add("dark");
    }
  }, [config.theme]);
}
