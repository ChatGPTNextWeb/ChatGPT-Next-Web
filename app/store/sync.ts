import { Updater } from "../typing";
import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import {
  AppState,
  getLocalAppState,
  mergeAppState,
  setLocalAppState,
} from "../utils/sync";
import { downloadAs, readFromFile } from "../utils";
import { showToast } from "../components/ui-lib";
import Locale from "../locales";

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

export const useSyncStore = createPersistStore(
  {
    webDavConfig: {
      server: "",
      username: "",
      password: "",
    },

    lastSyncTime: 0,
  },
  (set, get) => ({
    webDavConfig: {
      server: "",
      username: "",
      password: "",
    },

    lastSyncTime: 0,

    export() {
      const state = getLocalAppState();
      const fileName = `Backup-${new Date().toLocaleString()}.json`;
      downloadAs(JSON.stringify(state), fileName);
    },

    async import() {
      const rawContent = await readFromFile();

      try {
        const remoteState = JSON.parse(rawContent) as AppState;
        const localState = getLocalAppState();
        mergeAppState(localState, remoteState);
        setLocalAppState(localState);
        location.reload();
      } catch (e) {
        console.error("[Import]", e);
        showToast(Locale.Settings.Sync.ImportFailed);
      }
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
);
