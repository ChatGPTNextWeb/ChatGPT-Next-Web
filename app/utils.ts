import {
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
  useCallback,
  useMemo,
} from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";
import { RequestMessage } from "./client/api";
import { ServiceProvider, REQUEST_TIMEOUT_MS } from "./constant";
import isObject from "lodash-es/isObject";
import { fetch as tauriFetch, Body, ResponseType } from "@tauri-apps/api/http";

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
  measureDom.style.fontFamily = dom.style.fontFamily;
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
    "gemini-1.5-pro",
    "gemini-1.5-flash",
    "gpt-4o",
    "gpt-4o-mini",
  ];
  const isGpt4Turbo =
    model.includes("gpt-4-turbo") && !model.includes("preview");

  return (
    visionKeywords.some((keyword) => model.includes(keyword)) || isGpt4Turbo
  );
}

export function isDalle3(model: string) {
  return "dall-e-3" === model;
}

export function showPlugins(provider: ServiceProvider, model: string) {
  if (
    provider == ServiceProvider.OpenAI ||
    provider == ServiceProvider.Azure ||
    provider == ServiceProvider.Moonshot
  ) {
    return true;
  }
  if (provider == ServiceProvider.Anthropic && !model.includes("claude-2")) {
    return true;
  }
  return false;
}

export function fetch(
  url: string,
  options?: Record<string, unknown>,
): Promise<any> {
  if (window.__TAURI__) {
    const payload = options?.body || options?.data;
    return tauriFetch(url, {
      ...options,
      body:
        payload &&
        ({
          type: "Text",
          payload,
        } as any),
      timeout: ((options?.timeout as number) || REQUEST_TIMEOUT_MS) / 1000,
      responseType:
        options?.responseType == "text" ? ResponseType.Text : ResponseType.JSON,
    } as any);
  }
  return window.fetch(url, options);
}

export function adapter(config: Record<string, unknown>) {
  const { baseURL, url, params, ...rest } = config;
  const path = baseURL ? `${baseURL}${url}` : url;
  const fetchUrl = params
    ? `${path}?${new URLSearchParams(params as any).toString()}`
    : path;
  return fetch(fetchUrl as string, { ...rest, responseType: "text" });
}

/**
 * Copyright 2024 Sukka (https://skk.moe) and the contributors of foxact (https://foxact.skk.moe)
 * Licensed under the MIT License
 */

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const noop = () => {};

const stlProp = Object.getOwnPropertyDescriptor(Error, "stackTraceLimit");
const hasSTL = stlProp?.writable && typeof stlProp.value === "number";
const noSSRError = (
  errorMessage?: string | undefined,
  nextjsDigest = "BAILOUT_TO_CLIENT_SIDE_RENDERING",
) => {
  const originalStackTraceLimit = Error.stackTraceLimit;

  /**
   * This is *only* safe to do when we know that nothing at any point in the
   * stack relies on the `Error.stack` property of the noSSRError. By removing
   * the strack trace of the error, we can improve the performance of object
   * creation by a lot.
   */
  if (hasSTL) {
    Error.stackTraceLimit = 0;
  }

  const error = new Error(errorMessage);

  /**
   * Restore the stack trace limit to its original value after the error has
   * been created.
   */
  if (hasSTL) {
    Error.stackTraceLimit = originalStackTraceLimit;
  }

  // Next.js marks errors with `NEXT_DYNAMIC_NO_SSR_CODE` digest as recoverable:
  // https://github.com/vercel/next.js/blob/bef716ad031591bdf94058aaf4b8d842e75900b5/packages/next/src/shared/lib/lazy-dynamic/bailout-to-csr.ts#L2
  (error as any).digest = nextjsDigest;

  (error as any).recoverableError = "NO_SSR";

  return error;
};

type StorageType = "localStorage" | "sessionStorage";
type NotUndefined<T> = T extends undefined ? never : T;

// StorageEvent is deliberately not fired on the same document, we do not want to change that
type CustomStorageEvent = CustomEvent<string>;
declare global {
  interface WindowEventMap {
    "foxact-use-local-storage": CustomStorageEvent;
    "foxact-use-session-storage": CustomStorageEvent;
  }
}

export type Serializer<T> = (value: T) => string;
export type Deserializer<T> = (value: string) => T;

// This type utility is only used for workaround https://github.com/microsoft/TypeScript/issues/37663
const isFunction = (x: unknown): x is Function => typeof x === "function";

const identity = (x: any) => x;

export interface UseStorageRawOption {
  raw: true;
}

export interface UseStorageParserOption<T> {
  raw?: false;
  serializer: Serializer<T>;
  deserializer: Deserializer<T>;
}

const getServerSnapshotWithoutServerValue = () => {
  throw noSSRError(
    "useLocalStorage cannot be used on the server without a serverValue",
  );
};

function createStorage(type: StorageType) {
  const FOXACT_LOCAL_STORAGE_EVENT_KEY =
    type === "localStorage"
      ? "foxact-use-local-storage"
      : "foxact-use-session-storage";

  const foxactHookName =
    type === "localStorage"
      ? "foxact/use-local-storage"
      : "foxact/use-session-storage";

  const dispatchStorageEvent =
    typeof window !== "undefined"
      ? (key: string) => {
          window.dispatchEvent(
            new CustomEvent<string>(FOXACT_LOCAL_STORAGE_EVENT_KEY, {
              detail: key,
            }),
          );
        }
      : noop;

  const setStorageItem =
    typeof window !== "undefined"
      ? (key: string, value: string) => {
          try {
            window[type].setItem(key, value);
          } catch {
            console.warn(
              `[${foxactHookName}] Failed to set value to ${type}, it might be blocked`,
            );
          } finally {
            dispatchStorageEvent(key);
          }
        }
      : noop;

  const removeStorageItem =
    typeof window !== "undefined"
      ? (key: string) => {
          try {
            window[type].removeItem(key);
          } catch {
            console.warn(
              `[${foxactHookName}] Failed to remove value from ${type}, it might be blocked`,
            );
          } finally {
            dispatchStorageEvent(key);
          }
        }
      : noop;

  const getStorageItem = (key: string) => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      return window[type].getItem(key);
    } catch {
      console.warn(
        `[${foxactHookName}] Failed to get value from ${type}, it might be blocked`,
      );
      return null;
    }
  };

  const useSetStorage = <T>(key: string, serializer: Serializer<T>) =>
    useCallback(
      (v: T | null) => {
        try {
          if (v === null) {
            removeStorageItem(key);
          } else {
            setStorageItem(key, serializer(v));
          }
        } catch (e) {
          console.warn(e);
        }
      },
      [key, serializer],
    );

  // ssr compatible
  function useStorage<T>(
    key: string,
    serverValue: NotUndefined<T>,
    options?: UseStorageRawOption | UseStorageParserOption<T>,
  ): readonly [T, React.Dispatch<React.SetStateAction<T | null>>];
  // client-render only
  function useStorage<T>(
    key: string,
    serverValue?: undefined,
    options?: UseStorageRawOption | UseStorageParserOption<T>,
  ): readonly [T | null, React.Dispatch<React.SetStateAction<T | null>>];
  function useStorage<T>(
    key: string,
    serverValue?: NotUndefined<T> | undefined,
    options: UseStorageRawOption | UseStorageParserOption<T> = {
      serializer: JSON.stringify,
      deserializer: JSON.parse,
    },
  ):
    | readonly [T | null, React.Dispatch<React.SetStateAction<T | null>>]
    | readonly [T, React.Dispatch<React.SetStateAction<T | null>>] {
    const subscribeToSpecificKeyOfLocalStorage = useCallback(
      (callback: () => void) => {
        if (typeof window === "undefined") {
          return noop;
        }

        const handleStorageEvent = (e: StorageEvent) => {
          if (
            !("key" in e) || // Some browsers' strange quirk where StorageEvent is missing key
            e.key === key
          ) {
            callback();
          }
        };
        const handleCustomStorageEvent = (e: CustomStorageEvent) => {
          if (e.detail === key) {
            callback();
          }
        };

        window.addEventListener("storage", handleStorageEvent);
        window.addEventListener(
          FOXACT_LOCAL_STORAGE_EVENT_KEY,
          handleCustomStorageEvent,
        );
        return () => {
          window.removeEventListener("storage", handleStorageEvent);
          window.removeEventListener(
            FOXACT_LOCAL_STORAGE_EVENT_KEY,
            handleCustomStorageEvent,
          );
        };
      },
      [key],
    );

    const serializer: Serializer<T> = options.raw
      ? identity
      : options.serializer;
    const deserializer: Deserializer<T> = options.raw
      ? identity
      : options.deserializer;

    const getClientSnapshot = () => getStorageItem(key);

    // If the serverValue is provided, we pass it to useSES' getServerSnapshot, which will be used during SSR
    // If the serverValue is not provided, we don't pass it to useSES, which will cause useSES to opt-in client-side rendering
    const getServerSnapshot =
      serverValue !== undefined
        ? () => serializer(serverValue)
        : getServerSnapshotWithoutServerValue;

    const store = useSyncExternalStore(
      subscribeToSpecificKeyOfLocalStorage,
      getClientSnapshot,
      getServerSnapshot,
    );

    const deserialized = useMemo(
      () => (store === null ? null : deserializer(store)),
      [store, deserializer],
    );

    const setState = useCallback<
      React.Dispatch<React.SetStateAction<T | null>>
    >(
      (v) => {
        try {
          const nextState = isFunction(v) ? v(deserialized ?? null) : v;

          if (nextState === null) {
            removeStorageItem(key);
          } else {
            setStorageItem(key, serializer(nextState));
          }
        } catch (e) {
          console.warn(e);
        }
      },
      [key, serializer, deserialized],
    );

    useLayoutEffect(() => {
      if (getStorageItem(key) === null && serverValue !== undefined) {
        setStorageItem(key, serializer(serverValue));
      }
    }, [deserializer, key, serializer, serverValue]);

    const finalValue: T | null =
      deserialized === null
        ? // storage doesn't have value
          serverValue === undefined
          ? // no default value provided
            null
          : (serverValue satisfies NotUndefined<T>)
        : // storage has value
          (deserialized satisfies T);

    return [finalValue, setState] as const;
  }

  return {
    useStorage,
    useSetStorage,
  };
}

export const useLocalStorage = createStorage("localStorage").useStorage;
