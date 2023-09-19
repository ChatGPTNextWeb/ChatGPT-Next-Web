import { Updater } from "../typing";
import { ApiPath, StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import {
  AppState,
  getLocalAppState,
  GetStoreState,
  mergeAppState,
  setLocalAppState,
} from "../utils/sync";
import { downloadAs, readFromFile } from "../utils";
import { showToast } from "../components/ui-lib";
import Locale from "../locales";
import { createSyncClient, ProviderType } from "../utils/cloud";
import { corsPath } from "../utils/cors";

export interface WebDavConfig {
  endpoint: string;
  username: string;
  password: string;
  filename: string;
}

export interface GistConfig {
  filename: string;
  gistId: string;
  token: string;
}

export type SyncStore = GetStoreState<typeof useSyncStore> & {
  syncing: boolean;
};

export const useSyncStore = createPersistStore(
  {
    provider: ProviderType.WebDAV,
    useProxy: true,
    proxyUrl: corsPath(ApiPath.Cors),
    enableAccessControl: false,

    githubGist: {
      filename: "",
      gistId: "",
      token: "",
    },

    webdav: {
      endpoint: "",
      username: "",
      password: "",
      filename: "",
    },

    upstash: {
      endpoint: "",
      username: "",
      apiKey: "",
      filename: "",
    },

    lastSyncTime: 0,
    lastProvider: "",
    lastUpdateTime: 0,
    syncing: false,
  },
  (set, get) => ({
    countSync() {
      const config = get()[get().provider];
      return Object.values(config).every((c) => c.toString().length > 0);
    },

    markSyncTime(provider: ProviderType) {
      set({ lastSyncTime: Date.now(), lastProvider: provider });
    },

    markUpdateTime() {
      set({ lastUpdateTime: Date.now() });
    },
    // This will automatically generate JSON files without the need to include the ".json" extension.
    export() {
      const state = getLocalAppState();
      const fileName = `Backup-${new Date().toLocaleString()}`;
      downloadAs(state, fileName);
    },

    async import() {
      const rawContent = await readFromFile();

      try {
        const jsonChunks = rawContent.split("\n");
        const localState = getLocalAppState();

        for (const jsonChunk of jsonChunks) {
          const remoteState = JSON.parse(jsonChunk) as AppState;
          mergeAppState(localState, remoteState);
        }

        setLocalAppState(localState);
        location.reload();
      } catch (e) {
        console.error("[Import] Failed to import JSON file:", e);
        showToast(Locale.Settings.Sync.ImportFailed);
      }
    },

    getClient(provider: ProviderType) {
      const client = createSyncClient(provider, get());
      return client;
    },

    async sync(overwriteAccessControl: boolean = false) {
      if (get().syncing) {
        return;
      }

      const localState = getLocalAppState();
      const provider = get().provider;
      const config = get()[provider];
      const client = this.getClient(provider);

      try {
        set({ syncing: true }); // Set syncing to true before performing the sync
        const rawContent = await client.get(config.filename);
        const remoteState = JSON.parse(rawContent) as AppState;

        const sessions = localState[StoreKey.Chat].sessions;
        const currentSession =
          sessions[localState[StoreKey.Chat].currentSessionIndex];
        const filteredTopic =
          currentSession.topic === "New Conversation" &&
          currentSession.messages.length === 0;

        mergeAppState(localState, remoteState);

        if (filteredTopic) {
          const remoteSessions = remoteState[StoreKey.Chat].sessions;
          const remoteCurrentSession =
            remoteSessions[remoteState[StoreKey.Chat].currentSessionIndex];
          const remoteFilteredTopic =
            remoteCurrentSession.topic === "New Conversation" &&
            remoteCurrentSession.messages.length > 0;

          if (!remoteFilteredTopic) {
            localState[StoreKey.Chat].sessions[
              localState[StoreKey.Chat].currentSessionIndex
            ].mask = {
              ...currentSession.mask,
              name: remoteCurrentSession.mask.name,
            };
          }
        }

        setLocalAppState(localState);
      } catch (e) {
        console.log(
          `[Sync] Failed to get remote state from file '${config.filename}' for provider ['${provider}']:`,
          e,
          "Will attempt fixing it",
        );
      }

      if (overwriteAccessControl) {
        const accessControl = localState["access-control"];
        accessControl.accessCode;
        accessControl.hideUserApiKey;
        accessControl.disableGPT4;
      }

      if (provider === ProviderType.WebDAV) {
        await this.syncWebDAV(client, config.filename, localState);
      } else if (provider === ProviderType.GitHubGist) {
        await this.syncGitHubGist(client, config.filename, localState);
      }

      this.markSyncTime(provider);
      this.markUpdateTime(); // Call markUpdateTime to update lastUpdateTime
      set({ syncing: false });

      return true; // Add the return statement here
    },

    async syncWebDAV(client: any, value: string, localState: AppState) {
      await client.set(value, JSON.stringify(localState));
    },

    async syncGitHubGist(client: any, value: Object, localState: AppState) {
      await client.set(localState, value);
    },

    async check() {
      const client = this.getClient(get().provider);
      return await client.check();
    },
  }),
  {
    name: StoreKey.Sync,
    version: 1,
  },
);
