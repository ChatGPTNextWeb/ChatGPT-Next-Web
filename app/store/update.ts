import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FETCH_COMMIT_URL, FETCH_TAG_URL } from "../constant";
import { getCurrentVersion } from "../utils";

export interface UpdateStore {
  lastUpdate: number;
  remoteId: string;

  getLatestCommitId: (force: boolean) => Promise<string>;
}

export const UPDATE_KEY = "chat-update";

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      lastUpdate: 0,
      remoteId: "",

      async getLatestCommitId(force = false) {
        const overTenMins = Date.now() - get().lastUpdate > 10 * 60 * 1000;
        const shouldFetch = force || overTenMins;
        if (!shouldFetch) {
          return getCurrentVersion();
        }

        try {
          const data = await (await fetch(FETCH_TAG_URL)).json();
          const sha = data[0].name as string;
          const remoteId = sha.substring(0, 7);
          set(() => ({
            lastUpdate: Date.now(),
            remoteId,
          }));
          console.log("[Got Upstream] ", remoteId);
          return remoteId;
        } catch (error) {
          console.error("[Fetch Upstream Commit Id]", error);
          return getCurrentVersion();
        }
      },
    }),
    {
      name: UPDATE_KEY,
      version: 1,
    },
  ),
);
