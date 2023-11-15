import { BuildConfig, getBuildConfig } from "./build";

export function getClientConfig() {
  if (typeof document !== "undefined") {
    if (queryMeta("config")) {
      return JSON.parse(queryMeta("config")) as BuildConfig;
    }
    return { version: "1", buildMode: "standalone", isApp: true };
  }

  if (typeof process !== "undefined") {
    // server side
    return getBuildConfig();
  }
}

function queryMeta(key: string, defaultValue?: string): string {
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
