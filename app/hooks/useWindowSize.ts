import { useLayoutEffect, useRef } from "react";

type Size = {
  width: number;
  height: number;
};

export function useWindowSize(callback: (size: Size) => void) {
  const callbackRef = useRef<typeof callback>();

  callbackRef.current = callback;

  useLayoutEffect(() => {
    const onResize = () => {
      callbackRef.current?.({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    callback({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);
}
