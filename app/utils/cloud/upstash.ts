import { SyncStore } from "@/app/store/sync";

export type UpstashConfig = SyncStore["upstash"];
export type UpStashClient = ReturnType<typeof createUpstashClient>;

export function createUpstashClient(config: UpstashConfig) {
  return {
    async check() {
      return true;
    },

    async get() {
      throw Error("[Sync] not implemented");
    },

    async set() {
      throw Error("[Sync] not implemented");
    },

    headers() {
      return {
        Authorization: `Basic ${config.apiKey}`,
      };
    },
    path(path: string) {
      let url = config.endpoint;

      if (!url.endsWith("/")) {
        url += "/";
      }

      if (path.startsWith("/")) {
        path = path.slice(1);
      }

      return url + path;
    },
  };
}
