import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FETCH_COMMIT_URL, FETCH_TAG_URL } from "../constant";

export interface UpdateStore {
  lastUpdate: number;
  remoteVersion: string;

  version: string;
  getLatestVersion: (force: boolean) => Promise<string>;
}

export const UPDATE_KEY = "chat-update";

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

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      lastUpdate: 0,
      remoteVersion: "",

      version: "unknown",

      async getLatestVersion(force = false) {
        set(() => ({ version: queryMeta("version") }));

        const overTenMins = Date.now() - get().lastUpdate > 10 * 60 * 1000;
        const shouldFetch = force || overTenMins;
        if (!shouldFetch) {
          return get().version ?? "unknown";
        }

        try {
          // const data = await (await fetch(FETCH_TAG_URL)).json();
          // const remoteId = data[0].name as string;
          const data = await (await fetch(FETCH_COMMIT_URL)).json();
          const remoteId = (data[0].sha as string).substring(0, 7);
          set(() => ({
            lastUpdate: Date.now(),
            remoteVersion: remoteId,
          }));
          console.log("[Got Upstream] ", remoteId);
          return remoteId;
        } catch (error) {
          console.error("[Fetch Upstream Commit Id]", error);
          return get().version ?? "";
        }
      },
    }),
    {
      name: UPDATE_KEY,
      version: 1,
    },
  ),
);
