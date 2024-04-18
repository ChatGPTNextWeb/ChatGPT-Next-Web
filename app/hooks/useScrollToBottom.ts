import { RefObject, useEffect, useRef, useState } from "react";

export default function useScrollToBottom(
  scrollRef: RefObject<HTMLDivElement>,
) {
  const detach = scrollRef?.current
    ? Math.abs(
        scrollRef.current.scrollHeight -
          (scrollRef.current.scrollTop + scrollRef.current.clientHeight),
      ) <= 1
    : false;

  const initScrolled = useRef(false);
  // for auto-scroll
  const [autoScroll, setAutoScroll] = useState(true);
  function scrollDomToBottom() {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  // auto scroll
  useEffect(() => {
    if (autoScroll && !detach && !initScrolled.current) {
      scrollDomToBottom();
      initScrolled.current = true;
    }
  }, [autoScroll, detach]);

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}
