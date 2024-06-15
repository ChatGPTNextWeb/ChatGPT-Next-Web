import { BuildConfig, getBuildConfig } from "./build";

export function getClientConfig() {
  if (typeof document !== "undefined") {
    // client side
    return JSON.parse(queryMeta("config")) as BuildConfig;
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

// import { BuildConfig, getBuildConfig } from "./build";

// export function getClientConfig(): BuildConfig | undefined {
//   if (typeof document !== "undefined") {
//     // client side
//     const config = queryMeta("config");
//     return config ? (JSON.parse(config) as BuildConfig) : undefined;
//   }

//   if (typeof process !== "undefined") {
//     // server side
//     return getBuildConfig();
//   }
// }

// function queryMeta(key: string, defaultValue?: string): string {
//   if (typeof document !== "undefined") {
//     const meta = document.head.querySelector(
//       `meta[name='${key}']`,
//     ) as HTMLMetaElement;
//     return meta?.content ?? defaultValue ?? "";
//   } else {
//     return defaultValue ?? "";
//   }
// }
