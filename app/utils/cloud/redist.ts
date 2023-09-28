import { STORAGE_KEY } from "@/app/constant";
import { SyncStore } from "@/app/store/sync";
import Redis, { RedisOptions } from 'ioredis';

export type RedistConfig = SyncStore["redist"];
export type RedistClient = ReturnType<typeof createRedistClient>;

export function createRedistClient(store: SyncStore) {
  const config = store.redist;
  const storeKey = config.key.length === 0 ? STORAGE_KEY : config.key;
  const chunkCountKey = `${storeKey}-chunk-count`;
  const chunkIndexKey = (i: number) => `${storeKey}-chunk-${i}`;

  const redisOptions: RedisOptions = {
    host: config.endpoint,
    port: config.port,
    password: config.password,
    tls: {
      rejectUnauthorized: false, // Disable certificate verification
    },
  };

  const redisClient = new Redis(redisOptions);

  return {
    async check() {
      try {
        const result = await redisClient.ping();
        console.log('[Redist] check', result);
        return true;
      } catch (e) {
        console.error('[Redist] failed to check', e);
        return false;
      }
    },

    async redisGet(key: string) {
      try {
        const result = await redisClient.get(key);
        console.log('[Redist] get key =', key, result);
        return result;
      } catch (e) {
        console.error('[Redist] failed to get key =', key, e);
        return null;
      }
    },

    async redisSet(key: string, value: string) {
      try {
        await redisClient.set(key, value);
        console.log('[Redist] set key =', key);
      } catch (e) {
        console.error('[Redist] failed to set key =', key, e);
      }
    },

    async get() {
      const chunkCount = Number(await this.redisGet(chunkCountKey));
      if (!Number.isInteger(chunkCount)) return;

      const chunks = await Promise.all(
        new Array(chunkCount).fill(0).map((_, i) => this.redisGet(chunkIndexKey(i)))
      );
      console.log('[Redist] get full chunks', chunks);
      return chunks.join('');
    },

    async set(_: string, value: string) {
      const chunkSize = 100000; // Adjust the chunk size as needed
      const chunks = value.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
      let index = 0;

      for await (const chunk of chunks) {
        await this.redisSet(chunkIndexKey(index), chunk);
        index += 1;
      }

      await this.redisSet(chunkCountKey, index.toString());
    },
  };
}
