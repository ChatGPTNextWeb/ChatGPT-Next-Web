import { useLayoutEffect, useRef, useState } from "react";

type Size = {
  width: number;
  height: number;
};

export function useWindowSize(callback?: (size: Size) => void) {
  const callbackRef = useRef<typeof callback>();

  callbackRef.current = callback;

  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useLayoutEffect(() => {
    const onResize = () => {
      callbackRef.current?.({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    callback?.({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}
