/**
 * fork from element-plus
 * https://github.com/element-plus/element-plus/blob/dev/packages/components/input/src/utils.ts
 */

import { isFirefox } from "./utils";

let hiddenTextarea: HTMLTextAreaElement | undefined = undefined;

const HIDDEN_STYLE = `
  height:0 !important;
  visibility:hidden !important;
  ${isFirefox() ? "" : "overflow:hidden !important;"}
  position:absolute !important;
  z-index:-1000 !important;
  top:0 !important;
  right:0 !important;
`;

const CONTEXT_STYLE = [
  "letter-spacing",
  "line-height",
  "padding-top",
  "padding-bottom",
  "font-family",
  "font-weight",
  "font-size",
  "text-rendering",
  "text-transform",
  "width",
  "text-indent",
  "padding-left",
  "padding-right",
  "border-width",
  "box-sizing",
];

type NodeStyle = {
  contextStyle: string;
  boxSizing: string;
  paddingSize: number;
  borderSize: number;
};

type TextAreaHeight = {
  height: string;
  minHeight?: string;
};

function calculateNodeStyling(targetElement: Element): NodeStyle {
  const style = window.getComputedStyle(targetElement);

  const boxSizing = style.getPropertyValue("box-sizing");

  const paddingSize =
    Number.parseFloat(style.getPropertyValue("padding-bottom")) +
    Number.parseFloat(style.getPropertyValue("padding-top"));

  const borderSize =
    Number.parseFloat(style.getPropertyValue("border-bottom-width")) +
    Number.parseFloat(style.getPropertyValue("border-top-width"));

  const contextStyle = CONTEXT_STYLE.map(
    (name) => `${name}:${style.getPropertyValue(name)}`,
  ).join(";");

  return { contextStyle, paddingSize, borderSize, boxSizing };
}

export default function calcTextareaHeight(
  targetElement: HTMLTextAreaElement,
  minRows: number = 2,
  maxRows?: number,
): TextAreaHeight {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement("textarea");
    document.body.appendChild(hiddenTextarea);
  }

  const { paddingSize, borderSize, boxSizing, contextStyle } =
    calculateNodeStyling(targetElement);

  hiddenTextarea.setAttribute("style", `${contextStyle};${HIDDEN_STYLE}`);
  hiddenTextarea.value = targetElement.value || targetElement.placeholder || "";

  let height = hiddenTextarea.scrollHeight;
  const result = {} as TextAreaHeight;

  if (boxSizing === "border-box") {
    height = height + borderSize;
  } else if (boxSizing === "content-box") {
    height = height - paddingSize;
  }

  hiddenTextarea.value = "";
  const singleRowHeight = hiddenTextarea.scrollHeight - paddingSize;

  if (minRows) {
    let minHeight = singleRowHeight * minRows;
    if (boxSizing === "border-box") {
      minHeight = minHeight + paddingSize + borderSize;
    }
    height = Math.max(minHeight, height);
    result.minHeight = `${minHeight}px`;
  }
  if (maxRows) {
    let maxHeight = singleRowHeight * maxRows;
    if (boxSizing === "border-box") {
      maxHeight = maxHeight + paddingSize + borderSize;
    }
    height = Math.min(maxHeight, height);
  }
  result.height = `${height}px`;
  hiddenTextarea.parentNode?.removeChild(hiddenTextarea);
  hiddenTextarea = undefined;

  return result;
}
