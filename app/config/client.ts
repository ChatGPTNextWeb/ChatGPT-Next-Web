import { BuildConfig, getBuildConfig } from "./build";

export function getClientConfig() {
  if (typeof document !== "undefined") {
    // client side
    var config = queryMeta("config");

    if (config === "") {
      config =
        '{"version":"v2.9.2","commitDate":"1696087478000","commitHash":"0b7b5dbb8cff477cf4509fbbe0c8ad9f8099cf5a","buildMode":"standalone","isApp":false}';
    }
    console.log("config", config);
    return JSON.parse(config) as BuildConfig;
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
