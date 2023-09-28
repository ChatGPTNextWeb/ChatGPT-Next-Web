import { STORAGE_KEY } from "@/app/constant";
import { SyncStore } from "@/app/store/sync";
import { corsFetch } from "../cors";
import { chunks } from "../format";

export type RedistConfig = SyncStore["redist"];
export type RedistClient = ReturnType<typeof createRedistClient>;

export function createRedistClient(store: SyncStore) {
  const config = store.redist;
  const storeKey = config.username.length === 0 ? STORAGE_KEY : config.username;
  const chunkCountKey = `${storeKey}-chunk-count`;
  const chunkIndexKey = (i: number) => `${storeKey}-chunk-${i}`;

  const proxyUrl =
    store.useProxy && store.proxyUrl.length > 0 ? store.proxyUrl : undefined;

  return {
    async check() {
      try {
        const res = await corsFetch(this.path(`get/${storeKey}`), {
          method: "GET",
          headers: this.headers(),
          proxyUrl,
        });
        console.log("[Redist] check", res.status, res.statusText);
        return [200].includes(res.status);
      } catch (e) {
        console.error("[Redist] failed to check", e);
      }
      return false;
    },

    async redisGet(key: string) {
      const res = await corsFetch(this.path(`get/${key}`), {
        method: "GET",
        headers: this.headers(),
        proxyUrl,
      });

      console.log("[Redist] get key =", key, res.status, res.statusText);
      const resJson = (await res.json()) as { result: string };

      return resJson.result;
    },

    async redisSet(key: string, value: string) {
      const res = await corsFetch(this.path(`set/${key}`), {
        method: "POST",
        headers: this.headers(),
        body: value,
        proxyUrl,
      });

      console.log("[Redist] set key =", key, res.status, res.statusText);
    },

    async get() {
      const chunkCount = Number(await this.redisGet(chunkCountKey));
      if (!Number.isInteger(chunkCount)) return;

      const chunks = await Promise.all(
        new Array(chunkCount)
          .fill(0)
          .map((_, i) => this.redisGet(chunkIndexKey(i)))
      );
      console.log("[Redist] get full chunks", chunks);
      return chunks.join("");
    },

    async set(_: string, value: string) {

      let index = 0;
      for await (const chunk of chunks(value)) {
        await this.redisSet(chunkIndexKey(index), chunk);
        index += 1;
      }
      await this.redisSet(chunkCountKey, index.toString());
    },

    headers() {
      return {
        Authorization: `Bearer ${config.apiKey}`,
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
