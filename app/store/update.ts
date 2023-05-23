import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FETCH_COMMIT_URL, StoreKey } from "../constant";
import { api } from "../client/api";
import { showToast } from "../components/ui-lib";

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


const ONE_MINUTE = 10000;

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      lastUpdate: 0,
      remoteVersion: "",

      lastUpdateUsage: 0,

      version: "unknown",

      async getLatestVersion(force = false) {
        // Version checking functionality is disabled.
        return;
      },

      async updateUsage(force = false) {
        const overOneMinute = Date.now() - get().lastUpdateUsage >= ONE_MINUTE;
        if (!overOneMinute && !force) return;

        set(() => ({
          lastUpdateUsage: Date.now(),
        }));

        try {
          const usage = await api.llm.usage();

          if (usage) {
            set(() => ({
              used: usage.used,
              subscription: usage.total,
            }));
          }
        } catch (e) {
          showToast((e as Error).message);
        }
      },
    }),
    {
      name: StoreKey.Update,
      version: 1,
    },
  ),
);
