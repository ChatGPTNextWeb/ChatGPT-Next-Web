import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FETCH_COMMIT_URL, FETCH_TAG_URL, StoreKey } from "../constant";
import { api } from "../client/api";
import { getClientConfig } from "../config/client";

export interface UpdateStore {
  versionType: "date" | "tag";
  lastUpdate: number;
  version: string;
  remoteVersion: string;

  used?: number;
  subscription?: number;
  lastUpdateUsage: number;

  getLatestVersion: (force?: boolean) => Promise<void>;
  updateUsage: (force?: boolean) => Promise<void>;

  formatVersion: (version: string) => string;
}

const ONE_MINUTE = 60 * 1000;

function formatVersionDate(t: string) {
  const d = new Date(+t);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("");
}

async function getVersion(type: "date" | "tag") {
  if (type === "date") {
    const data = (await (await fetch(FETCH_COMMIT_URL)).json()) as {
      commit: {
        author: { name: string; date: string };
      };
      sha: string;
    }[];
    const remoteCommitTime = data[0].commit.author.date;
    const remoteId = new Date(remoteCommitTime).getTime().toString();
    return remoteId;
  } else if (type === "tag") {
    const data = (await (await fetch(FETCH_TAG_URL)).json()) as {
      commit: { sha: string; url: string };
      name: string;
    }[];
    return data.at(0)?.name;
  }
}

export const useUpdateStore = create<UpdateStore>()(
  persist(
    (set, get) => ({
      versionType: "tag",
      lastUpdate: 0,
      version: "unknown",
      remoteVersion: "",

      lastUpdateUsage: 0,

      formatVersion(version: string) {
        if (get().versionType === "date") {
          version = formatVersionDate(version);
        }
        return version;
      },

      async getLatestVersion(force = false) {
        const versionType = get().versionType;
        let version =
          versionType === "date"
            ? getClientConfig()?.commitDate
            : getClientConfig()?.version;

        set(() => ({ version }));

        const shouldCheck = Date.now() - get().lastUpdate > 2 * 60 * ONE_MINUTE;
        if (!force && !shouldCheck) return;

        set(() => ({
          lastUpdate: Date.now(),
        }));

        try {
          const remoteId = await getVersion(versionType);
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

        try {
          const usage = await api.llm.usage();

          if (usage) {
            set(() => ({
              used: usage.used,
              subscription: usage.total,
            }));
          }
        } catch (e) {
          console.error((e as Error).message);
        }
      },
    }),
    {
      name: StoreKey.Update,
      version: 1,
    },
  ),
);
