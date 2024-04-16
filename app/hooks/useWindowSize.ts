import { useLayoutEffect, useMemo, useRef } from "react";

type Size = {
  width: number;
  height: number;
};

export function useWindowSize(callback: (size: Size) => void) {
  const callbackRef = useRef<typeof callback>();
  const hascalled = useRef(false);

  if (typeof window !== "undefined" && !hascalled.current) {
    callback({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    hascalled.current = true;
  }

  callbackRef.current = callback;

  useLayoutEffect(() => {
    const onResize = () => {
      callbackRef.current?.({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);
}
