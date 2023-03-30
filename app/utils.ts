import { showToast } from "./components/ui-lib";
import Locale from "./locales";

export function trimTopic(topic: string) {
  const s = topic.split("");
  let lastChar = s.at(-1); // 获取 s 的最后一个字符
  let pattern = /[，。！？、,.!?]/; // 定义匹配中文和英文标点符号的正则表达式
  while (lastChar && pattern.test(lastChar!)) {
    s.pop();
    lastChar = s.at(-1);
  }

  return s.join("");
}

export function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then((res) => {
      showToast(Locale.Copy.Success);
    })
    .catch((err) => {
      showToast(Locale.Copy.Failed);
    });
}

export function downloadAs(text: string, filename: string) {
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

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function isMobileScreen() {
  return window.innerWidth <= 600;
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

export function queryMeta(key: string, defaultValue?: string): string {
  let ret: string;
  if (document) {
    const meta = document.head.querySelector(
      `meta[name='${key}']`,
    ) as HTMLMetaElement;
    ret = meta?.content ?? "";
  } else {
    ret = defaultValue ?? "";
  }

  return ret;
}

let currentId: string;
export function getCurrentVersion() {
  if (currentId) {
    return currentId;
  }

  currentId = queryMeta("version");

  return currentId;
}
