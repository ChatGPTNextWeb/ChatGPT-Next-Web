import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FETCH_COMMIT_URL, FETCH_TAG_URL, StoreKey } from "../constant";
import { requestUsage } from "../requests";

export interface UpdateStore {
  lastUpdate: number;
  remoteVersion: string;

  used?: number;
  subscription?: number;
  lastUpdateUsage: number;

  version: string;
  getLatestVersion: (force?: boolean) => Promise<void>;
  updateUsage: (force?: boolean) => Promise<void>;
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

const ONE_MINUTE = 60 * 1000;

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      lastUpdate: 0,
      remoteVersion: "",

      lastUpdateUsage: 0,

      version: "unknown",

      async getLatestVersion(force = false) {
        set(() => ({ version: queryMeta("version") ?? "unknown" }));

        const overTenMins = Date.now() - get().lastUpdate > 10 * ONE_MINUTE;
        if (!force && !overTenMins) return;

        set(() => ({
          lastUpdate: Date.now(),
        }));

        try {
          const data = await (await fetch(FETCH_COMMIT_URL)).json();
          const remoteCommitTime = data[0].commit.committer.date;
          const remoteId = new Date(remoteCommitTime).getTime().toString();
          set(() => ({
            remoteVersion: remoteId,
          }));
          console.log("[Got Upstream] ", remoteId);
        } catch (error) {
          console.error("[Fetch Upstream Commit Id]", error);
        }
      },

      async updateUsage(force = false) {
        const overOneMinute = Date.now() - get().lastUpdateUsage >= ONE_MINUTE;
        if (!overOneMinute && !force) return;

        set(() => ({
          lastUpdateUsage: Date.now(),
        }));

        const usage = await requestUsage();

        if (usage) {
          set(() => usage);
        }
      },
    }),
    {
      name: StoreKey.Update,
      version: 1,
    },
  ),
);
