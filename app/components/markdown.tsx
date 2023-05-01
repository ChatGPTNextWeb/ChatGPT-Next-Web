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
import React from "react";

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

function _MarkDownContent(props: { content: string }) {
  return (
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
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef: RefObject<HTMLDivElement>;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);
  const renderedHeight = useRef(0);
  const inView = useRef(false);

  const parent = props.parentRef.current;
  const md = mdRef.current;

  const checkInView = () => {
    if (parent && md) {
      const parentBounds = parent.getBoundingClientRect();
      const twoScreenHeight = Math.max(500, parentBounds.height * 2);
      const mdBounds = md.getBoundingClientRect();
      const isInRange = (x: number) =>
        x <= parentBounds.bottom + twoScreenHeight &&
        x >= parentBounds.top - twoScreenHeight;
      inView.current = isInRange(mdBounds.top) || isInRange(mdBounds.bottom);
    }

    if (inView.current && md) {
      renderedHeight.current = Math.max(
        renderedHeight.current,
        md.getBoundingClientRect().height,
      );
    }
  };

  checkInView();

  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
        height:
          !inView.current && renderedHeight.current > 0
            ? renderedHeight.current
            : "auto",
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
    >
      {inView.current &&
        (props.loading ? (
          <LoadingIcon />
        ) : (
          <MarkdownContent content={props.content} />
        ))}
    </div>
  );
}
