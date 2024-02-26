import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RehypeKatex from "rehype-katex";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect, useMemo } from "react";
import { copyToClipboard } from "../utils";
import mermaid from "mermaid";

import LoadingIcon from "../icons/three-dots.svg";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { showImageModal } from "./ui-lib";

export function Mermaid(props: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
          suppressErrors: true,
        })
        .catch((e) => {
          setHasError(true);
          console.error("[Mermaid] ", e.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    showImageModal(URL.createObjectURL(blob));
  }

  if (hasError) {
    return null;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refText]);

  return (
    <>
      {mermaidCode.length > 0 && (
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
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
    </>
  );
}

function escapeDollarNumber(text: string): string {
  let escapedText = "";

  // 使用正则表达式进行匹配和分割来处理独行公式和代码块
  const pattern = /(\$\$.+?\$\$|```.*?```|\n)/gs;

  // 检查是否为数字
  const isDigit = (char: string) => /^\d$/.test(char);

  // 记录是否在代码块内
  let isCodeBlock = false;

  // 正则分割文本，以处理独立公式和代码块
  const parts = text.split(pattern);

  parts.forEach((part) => {
    // 检查当前部分是否是独行公式或代码块
    if (part.startsWith("```")) {
      isCodeBlock = !isCodeBlock; // 反转代码块状态标志
      escapedText += part; // 直接添加，不处理
      return;
    } else if (part.startsWith("$$") && part.endsWith("$$") && part !== "\n") {
      // 对于独行公式，直接添加
      escapedText += part;
      return;
    } else if (part === "\n") {
      // 处理换行符
      escapedText += part;
      return;
    }

    // 处理非代码块的文本内容
    if (!isCodeBlock) {
      // 预扫描，避免在代码块内转义
      for (let i = 0; i < part.length; i++) {
        const char = part[i];
        // 处理"$"加数字情况
        if (char === "$" && i < part.length - 1 && isDigit(part[i + 1])) {
          // 检查是否成对出现且下一个字符依然是数字
          let j = i + 1;
          while (j < part.length && part[j] !== "$") j++;
          if (j < part.length && isDigit(part[j + 1])) {
            escapedText += "\\$"; // 转义当前字符
            continue;
          }
        }
        escapedText += char; // 添加当前字符
      }
    } else {
      escapedText += part; // 在代码块中，直接添加
    }
  });

  return escapedText;
}

function _MarkDownContent(props: { content: string }) {
  const escapedContent = useMemo(
    () => escapeDollarNumber(props.content),
    [props.content],
  );

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
        p: (pProps) => <p {...pProps} dir="auto" />,
        a: (aProps) => {
          const href = aProps.href || "";
          const isInternal = /^\/#/i.test(href);
          const target = isInternal ? "_self" : aProps.target ?? "_blank";
          return <a {...aProps} target={target} />;
        },
      }}
    >
      {escapedContent}
    </ReactMarkdown>
  );
}

export const MarkdownContent = React.memo(_MarkDownContent);

export function Markdown(
  props: {
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
      dir="auto"
    >
      {props.loading ? (
        <LoadingIcon />
      ) : (
        <MarkdownContent content={props.content} />
      )}
    </div>
  );
}
