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

  // for auto-scroll
  const [autoScroll, setAutoScroll] = useState(true);

  const autoScrollRef = useRef<typeof autoScroll>();

  autoScrollRef.current = autoScroll;

  function scrollDomToBottom() {
    const dom = scrollRef.current;
    if (dom) {
      requestAnimationFrame(() => {
        setAutoScroll(true);
        dom.scrollTo(0, dom.scrollHeight);
      });
    }
  }

  // useEffect(() => {
  //   const dom = scrollRef.current;
  //   if (dom) {
  //     dom.ontouchstart = (e) => {
  //       const autoScroll = autoScrollRef.current;
  //       if (autoScroll) {
  //         setAutoScroll(false);
  //       }
  //     }
  //     dom.onscroll = (e) => {
  //       const autoScroll = autoScrollRef.current;
  //       if (autoScroll) {
  //         setAutoScroll(false);
  //       }
  //     }
  //   }
  // }, []);

  // auto scroll
  useEffect(() => {
    if (autoScroll && !detach) {
      scrollDomToBottom();
    }
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollDomToBottom,
  };
}
