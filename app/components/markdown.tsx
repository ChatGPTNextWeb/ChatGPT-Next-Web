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
import { useDebouncedCallback, useThrottledCallback } from "use-debounce";
import { showImageModal } from "./ui-lib";
import { isIOS, isMacOS } from "../utils"; // Import the isIOS & isMacOS functions from the utils file

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

function escapeMarkdownContent(content: string): string {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAppleIosDevice = isIOS() || isMacOS(); // Load isAppleDevice from isIOS functions
  // According to this post: https://www.drupal.org/project/next_webform/issues/3358901
  // iOS 16.4 is the first version to support lookbehind
  const iosVersionSupportsLookBehind = 16.4;
  let doesIosSupportLookBehind = false;

  if (isAppleIosDevice) {
    const match = /os (\d+([_.]\d+)+)/.exec(userAgent);
    if (match && match[1]) {
      const iosVersion = parseFloat(match[1].replace("_", "."));
      doesIosSupportLookBehind = iosVersion >= iosVersionSupportsLookBehind;
    }
  }

  if (isAppleIosDevice && !doesIosSupportLookBehind) {
    return content.replace(
      // Exclude code blocks & math block from replacement
      // custom-regex for unsupported Apple devices
      /(`{3}[\s\S]*?`{3}|`[^`]*`)|(\$(?!\$))/g,
      (match, codeBlock) => {
        if (codeBlock) {
          return match; // Return the code block as it is
        } else {
          return "&#36;"; // Escape dollar signs outside of code blocks
        }
      }
    );
  } else {
    return content.replace(
      // Exclude code blocks & math block from replacement
      /(`{3}[\s\S]*?`{3}|`[^`]*`)|(?<!\$)(\$(?!\$))/g,
      (match, codeBlock) => {
        if (codeBlock) {
          return match; // Return the code block as it is
        } else {
          return "&#36;"; // Escape dollar signs outside of code blocks
        }
      }
    );
  }
}

function _MarkDownContent(props: { content: string }) {
  const escapedContent = useMemo(() => escapeMarkdownContent(props.content), [
    props.content,
  ]);

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
