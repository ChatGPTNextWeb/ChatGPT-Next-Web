import { getClientConfig } from "../config/client";
import { Updater } from "../typing";
import { ApiPath, STORAGE_KEY, StoreKey } from "../constant";
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
import Cookies from "js-cookie";
import { ChatMessage, useChatStore } from "./chat";

export interface WebDavConfig {
  server: string;
  username: string;
  password: string;
}

const isApp = !!getClientConfig()?.isApp;
export type SyncStore = GetStoreState<typeof useSyncStore>;

const DEFAULT_SYNC_STATE = {
  provider: ProviderType.WebDAV,
  useProxy: true,
  proxyUrl: corsPath(ApiPath.Cors),

  webdav: {
    endpoint: "",
    username: "",
    password: "",
  },

  upstash: {
    endpoint: "",
    username: STORAGE_KEY,
    apiKey: "",
  },

  lastSyncTime: 0,
  lastProvider: "",
};

interface Message {
  chat_id: string;
  created_at: string;
  id: string;
  model_id: string;
  regenerated: boolean;
  role: string;
  text: string;
  updated_at: string;
  user_id: string;
}
interface OrganizedData {
  [chatId: string]: any[];
}
function organizeChatMessages(messages: Message[]): OrganizedData {
  const organizedData: OrganizedData = {};
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  };

  // Organize messages by chat ID
  for (const message of messages) {
    const chatId = message.chat_id;
    if (!organizedData[chatId]) {
      organizedData[chatId] = [];
    }
    organizedData[chatId].push({
      id: message.id,
      role: message.role,
      content: message.text,
      date: message.created_at,
    });
  }

  for (const chatId in organizedData) {
    organizedData[chatId].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    organizedData[chatId].forEach((message) => {
      message.date = new Intl.DateTimeFormat("en-US", options).format(
        new Date(message.date),
      );
    });
  }
  return organizedData;
}
// Sort messages within each chat ID array based on creation time
// for (const chatId in organizedData) {
//   organizedData[chatId].sort((a, b) => {
//     const dateComparison =
//       new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

//     if (dateComparison === 0) {
//       // If the dates are the same, sort by user type
//       if (a.role === "user" && b.role === "assistant") {
//         return -1; // User comes first
//       } else if (a.role === "assistant" && b.role === "user") {
//         return 1; // Assistant comes first
//       } else {
//         // If both are users or both are assistants, maintain the original order
//         return 0;
//       }
//     } else {
//       return dateComparison;
//     }
//   });
// }
export const useSyncStore = createPersistStore(
  DEFAULT_SYNC_STATE,
  (set, get) => ({
    cloudSync() {
      const config = get()[get().provider];
      return Object.values(config).every((c) => c.toString().length > 0);
    },

    markSyncTime() {
      set({ lastSyncTime: Date.now(), lastProvider: get().provider });
    },

    export() {
      const state = getLocalAppState();
      const datePart = isApp
        ? `${new Date().toLocaleDateString().replace(/\//g, "_")} ${new Date()
            .toLocaleTimeString()
            .replace(/:/g, "_")}`
        : new Date().toLocaleString();

      const fileName = `Backup-${datePart}.json`;
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

    getClient() {
      const provider = get().provider;
      const client = createSyncClient(provider, get());
      return client;
    },

    async sync() {
      const localState = getLocalAppState();
      const authToken = Cookies.get("auth_token");

      try {
        const response = await fetch("https://cloak.i.inc/sync/all", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to sync messages");
        }
        const fetchedMessages = await response.json();
        const extracted = organizeChatMessages(fetchedMessages.messages);
        const chatIdSet = new Set(Object.keys(extracted));
        const updatedSet: Set<string> = new Set();

        for (const session of localState["chat-next-web-store"].sessions) {
          const currChatId = session["chat_id"];
          if (chatIdSet.has(currChatId)) {
            updatedSet.add(currChatId);
            session.messages = extracted[currChatId];
          }
        }
        const difference = [...chatIdSet];
        for (const element of updatedSet) {
          const index = difference.indexOf(element);
          if (index !== -1) {
            difference.splice(index, 1);
          }
        }

        for (const chatId of difference) {
          const messages: ChatMessage[] = extracted[chatId];
          useChatStore.getState().newSession(undefined, chatId, messages);
        }
        // setLocalAppState(localState);
      } catch (e) {
        console.log("[Sync] failed to get remote state", e);
        throw e;
      }

      // this.markSyncTime();
    },

    async check() {
      const client = this.getClient();
      return await client.check();
    },
  }),
  {
    name: StoreKey.Sync,
    version: 1.2,

    migrate(persistedState, version) {
      const newState = persistedState as typeof DEFAULT_SYNC_STATE;

      if (version < 1.1) {
        newState.upstash.username = STORAGE_KEY;
      }

      if (version < 1.2) {
        if (
          (persistedState as typeof DEFAULT_SYNC_STATE).proxyUrl ===
          "/api/cors/"
        ) {
          newState.proxyUrl = "";
        }
      }

      return newState as any;
    },
  },
);
