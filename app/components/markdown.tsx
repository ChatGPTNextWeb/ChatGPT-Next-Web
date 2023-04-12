import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect } from "react";
import { copyToClipboard } from "../utils";

import LoadingIcon from "../icons/three-dots.svg";

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);

  return (
    <pre ref={ref}>
      <span
        className="copy-code-button"
        onClick={() => {
          if (ref.current) {
            const code = ref.current.innerText;
            copyToClipboard(code);
          }
        }}
      ></span>
      {props.children}
    </pre>
  );
}

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef: RefObject<HTMLDivElement>;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);

  const parent = props.parentRef.current;
  const md = mdRef.current;
  const rendered = useRef(true); // disable lazy loading for bad ux
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    // to triggr rerender
    setCounter(counter + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.loading]);

  const inView =
    rendered.current ||
    (() => {
      if (parent && md) {
        const parentBounds = parent.getBoundingClientRect();
        const mdBounds = md.getBoundingClientRect();
        const isInRange = (x: number) =>
          x <= parentBounds.bottom && x >= parentBounds.top;
        const inView = isInRange(mdBounds.top) || isInRange(mdBounds.bottom);

        if (inView) {
          rendered.current = true;
        }

        return inView;
      }
    })();

  const shouldLoading = props.loading || !inView;

  return (
    <div
      className="markdown-body"
      style={{ fontSize: `${props.fontSize ?? 14}px` }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
    >
      {shouldLoading ? (
        <LoadingIcon />
      ) : (
        <ReactMarkdown
          remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
          rehypePlugins={[
            RehypeKatex,
            [
              RehypeHighlight,
              {
                detect: false,
                ignoreMissing: true,
              },
            ],
          ]}
          components={{
            pre: PreCode,
          }}
          linkTarget={"_blank"}
        >
          {props.content}
        </ReactMarkdown>
      )}
    </div>
  );
}
