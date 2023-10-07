import { Updater } from "../typing";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StoreKey } from "../constant";

export interface WebDavConfig {
  server: string;
  username: string;
  password: string;
}

export interface SyncStore {
  webDavConfig: WebDavConfig;
  lastSyncTime: number;

  update: Updater<WebDavConfig>;
  check: () => Promise<boolean>;

  path: (path: string) => string;
  headers: () => { Authorization: string };
}

const FILE = {
  root: "/chatgpt-next-web/",
};

export const useSyncStore = create<SyncStore>()(
  persist(
    (set, get) => ({
      webDavConfig: {
        server: "",
        username: "",
        password: "",
      },

      lastSyncTime: 0,

      update(updater) {
        const config = { ...get().webDavConfig };
        updater(config);
        set({ webDavConfig: config });
      },

      async check() {
        try {
          const res = await fetch(this.path(""), {
            method: "PROFIND",
            headers: this.headers(),
          });
          console.log(res);
          return res.status === 207;
        } catch (e) {
          console.error("[Sync] ", e);
          return false;
        }
      },

      path(path: string) {
        let url = get().webDavConfig.server;

        if (!url.endsWith("/")) {
          url += "/";
        }

        if (path.startsWith("/")) {
          path = path.slice(1);
        }

        return url + path;
      },

      headers() {
        const auth = btoa(
          [get().webDavConfig.username, get().webDavConfig.password].join(":"),
        );

        return {
          Authorization: `Basic ${auth}`,
        };
      },
    }),
    {
      name: StoreKey.Sync,
      version: 1,
    },
  ),
);
