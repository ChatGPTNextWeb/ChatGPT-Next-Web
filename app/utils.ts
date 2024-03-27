import { useEffect, useState } from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";
import { RequestMessage } from "./client/api";
import { DEFAULT_MODELS } from "./constant";

export function trimTopic(topic: string) {
  // Fix an issue where double quotes still show in the Indonesian language
  // This will remove the specified punctuation from the end of the string
  // and also trim quotes from both the start and end if they exist.
  return (
    topic
      // fix for gemini
      .replace(/^["“”*]+|["“”*]+$/g, "")
      .replace(/[，。！？”“"、,.!?*]*$/, "")
  );
}

export async function copyToClipboard(text: string) {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }

    showToast(Locale.Copy.Success);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export async function downloadAs(text: string, filename: string) {
  if (window.__TAURI__) {
    const result = await window.__TAURI__.dialog.save({
      defaultPath: `${filename}`,
      filters: [
        {
          name: `${filename.split(".").pop()} files`,
          extensions: [`${filename.split(".").pop()}`],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (result !== null) {
      try {
        await window.__TAURI__.fs.writeTextFile(result, text);
        showToast(Locale.Download.Success);
      } catch (error) {
        showToast(Locale.Download.Failed);
      }
    } else {
      showToast(Locale.Download.Failed);
    }
  } else {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}

export function compressImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent: any) => {
      const image = new Image();
      image.onload = () => {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let width = image.width;
        let height = image.height;
        let quality = 0.9;
        let dataUrl;

        do {
          canvas.width = width;
          canvas.height = height;
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
          ctx?.drawImage(image, 0, 0, width, height);
          dataUrl = canvas.toDataURL("image/jpeg", quality);

          if (dataUrl.length < maxSize) break;

          if (quality > 0.5) {
            // Prioritize quality reduction
            quality -= 0.1;
          } else {
            // Then reduce the size
            width *= 0.9;
            height *= 0.9;
          }
        } while (dataUrl.length > maxSize);

        resolve(dataUrl);
      };
      image.onerror = reject;
      image.src = readerEvent.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function readFromFile() {
  return new Promise<string>((res, rej) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        res(e.target.result);
      };
      fileReader.onerror = (e) => rej(e);
      fileReader.readAsText(file);
    };

    fileInput.click();
  });
}

export function file2Base64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result 包含转换为base64的文件内容
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    // 启动文件读取过程
    reader.readAsDataURL(file);
  });
}

export function base64ToFile(base64: any, filename = "image.png") {
  // Extract MIME type from the base64 data
  const match = base64.match(/^data:(.*?);base64,/);
  if (!match) {
    throw new Error("Invalid base64 data");
  }
  const mimeType = match[1];

  // Remove URL encoding from the base64 data
  const base64WithoutPrefix = base64.split(";base64,").pop();

  // Convert base64 to a Uint8Array
  const byteCharacters = atob(base64WithoutPrefix);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Create a Blob from the Uint8Array
  const blob = new Blob([byteArray], { type: mimeType });

  // Create and return a File object from the Blob
  return new File([blob], filename, { type: mimeType });
}

export function createObjectURL(blob: Blob) {
  return (window.URL || window.webkitURL).createObjectURL(blob);
}

export function getBlobUrl2File(blobUrl: string, filename: string = "image") {
  return new Promise<File>((resolve, reject) => {
    fetch(blobUrl)
      .then((res) => res.blob())
      .then((blob) => {
        resolve(new File([blob], filename, { type: blob.type }));
      })
      .catch(reject);
  });
}

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

export const MOBILE_MAX_WIDTH = 600;
export function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}

export function isFirefox() {
  return (
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)
  );
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom);
  const paddingWidth =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);

  if (!dom) {
    dom = document.createElement("span");
    dom.style.position = "absolute";
    dom.style.wordBreak = "break-word";
    dom.style.fontSize = "14px";
    dom.style.transform = "translateY(-200vh)";
    dom.style.pointerEvents = "none";
    dom.style.opacity = "0";
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }

  return dom!;
}

export function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom("__measure");
  const singleLineDom = getOrCreateMeasureDom("__single_measure", (dom) => {
    dom.innerText = "TEXT_FOR_MEASURE";
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + "px";
  measureDom.innerText = dom.value !== "" ? dom.value : "1";
  measureDom.style.fontSize = dom.style.fontSize;
  const endWithEmptyLine = dom.value.endsWith("\n");
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height,
  );

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

/**
 * Detects Macintosh
 */
export function isMacOS(): boolean {
  if (typeof window !== "undefined") {
    let userAgent = window.navigator.userAgent.toLocaleLowerCase();
    const macintosh = /iphone|ipad|ipod|macintosh/.test(userAgent);
    return !!macintosh;
  }
  return false;
}

export function getMessageTextContent(message: RequestMessage) {
  if (typeof message.content === "string") {
    return message.content;
  }
  for (const c of message.content) {
    if (c.type === "text") {
      return c.text ?? "";
    }
  }
  return "";
}

export function getMessageImages(message: RequestMessage): string[] {
  if (typeof message.content === "string") {
    return [];
  }
  const urls: string[] = [];
  for (const c of message.content) {
    if (c.type === "image_url") {
      urls.push(c.image_url?.url ?? "");
    }
  }
  return urls;
}

export function isVisionModel(model: string) {
  // Note: This is a better way using the TypeScript feature instead of `&&` or `||` (ts v5.5.0-dev.20240314 I've been using)
  const visionKeywords = [
    "vision",
    "claude-3",
  ];

  return visionKeywords.some(keyword => model.includes(keyword));
}

export function isDalleModel(model: string) {
  return model.startsWith("dall-e");
}

export function isDalle2Model(model: string) {
  return model.startsWith("dall-e-2");
}

export function isDalle3Model(model: string) {
  return model.startsWith("dall-e-3");
}

export function isNotDalle2DefaultMode(model: string, mode: string) {
  return isDalle2Model(model) && mode !== "Default";
}

export function isDalle2VariationMode(model: string, mode: string) {
  return isDalle2Model(model) && mode === "CreateVariation";
}

export function isDalle2EditMode(model: string, mode: string) {
  return isDalle2Model(model) && mode === "Edit";
}
