import { RUNTIME_CONFIG_DOM } from "../constant";

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

export function getClientSideConfig() {
  if (typeof window === "undefined") {
    throw Error(
      "[Client Config] you are importing a browser-only module outside of browser",
    );
  }

  const dom = document.getElementById(RUNTIME_CONFIG_DOM);

  if (!dom) {
    throw Error("[Config] Dont get config before page loading!");
  }

  try {
    const fromServerConfig = JSON.parse(dom.innerText) as DangerConfig;
    const fromBuildConfig = {
      version: queryMeta("version"),
    };
    return {
      ...fromServerConfig,
      ...fromBuildConfig,
    };
  } catch (e) {
    console.error("[Config] failed to parse client config");
  }
}
