// retur user device info

import { useEffect, useState } from "react";

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState({});

  const [systemInfo, setSystemInfo] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<string | null>(null);
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(userAgent)) {
      setSystemInfo("iOS");
    }
  }, []);

  useEffect(() => {
    const onResize = () => {
      setDeviceInfo({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (window.innerWidth < 600) {
      setDeviceType("mobile");
    } else {
      setDeviceType("desktop");
    }

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return {
    windowSize: deviceInfo,
    systemInfo,
    deviceType,
  };
}
