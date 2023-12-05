// redisRestClient.ts
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

const getRedisClient = () => {
  if (!redis) {
    const redisUrl = process.env.UPSTASH_REDIS_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!redisUrl || !redisToken) {
      // Handle missing environment variables more gracefully
      console.error('The Upstash Redis URL and token must be provided.');
      return null; // Or throw an error if that's the desired behavior
    }

    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });
  }
  return redis;
};



export const incrementSignInCount = async (
  email: string | undefined,
  dateKey: string
): Promise<void> => {
  if (!email) {
    console.error('Email is undefined, cannot increment sign-in count.');
    return; // This is fine for a function returning Promise<void>
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return; // This is fine for a function returning Promise<void>
  }

  try {
    await redis.hincrby(`signin_count:${email}`, dateKey, 1);
  } catch (error) {
    console.error('Failed to increment sign-in count in Redis via Upstash', error);
  }
};

export const incrementSessionRefreshCount = async (
  email: string | undefined,
  dateKey: string
): Promise<void> => {
  if (!email) {
    console.error('Email is undefined, cannot increment session refresh count.');
    return; // This is fine for a function returning Promise<void>
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return; // This is fine for a function returning Promise<void>
  }

  try {
    await redis.hincrby(`session_refreshes:${email}`, dateKey, 1);
    const timeValue = new Date().toISOString(); // full date
    await redis.hset(`monitoring`, `last_sessionInc`, timeValue);
  } catch (error) {
    console.error('Failed to increment session refresh count in Redis via Upstash', error);
  }
};

export const incrementAPICallCount = async (
  email: string | undefined,
  modelIdentifier: string,
  dateKey: string
): Promise<void> => {
  if (!email || !modelIdentifier) {
    console.error('Email or model identifier is undefined, cannot increment API call count.');
    return; // This is fine for a function returning Promise<void>
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return; // This is fine for a function returning Promise<void>
  }

  const key = `api_calls:${email}:${modelIdentifier}`;

  try {
    await redis.hincrby(key, dateKey, 1);
  } catch (error) {
    console.error('Failed to increment API call count in Redis via Upstash', error);
  }
};


export const incrementTokenCounts = async (
  email: string | undefined,
  dateKey: string,
  completionTokens: number,
  promptTokens: number
) => {
  if (!email) {
    console.error('Email is undefined, cannot increment token counts.');
    return;
  }

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return;
  }

  try {
    await redis.hincrby(`tokens:${email}`, `${dateKey}:completion_tokens`, completionTokens);
    await redis.hincrby(`tokens:${email}`, `${dateKey}:prompt_tokens`, promptTokens);
  } catch (error) {
    console.error('Failed to increment token counts in Redis via Upstash', error);
  }
};


export const getAvailableDateKeys = async (): Promise<string[]> => {

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return []; // Return an empty array explicitly
  }

  try {
    const keys = await redis.keys('signin_count:*');
    return keys.map(key => key.split(':')[1]);
  } catch (error) {
    console.error('Failed to get keys from Redis', error);
    return [];
  }
};

export const getSignInCountForPeriod = async (dateKey: string): Promise<number> => {

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return 0; // Return a default number, typically 0 for counts
  }

  try {
    const counts = await redis.hgetall(`signin_count:${dateKey}`);
    if (counts === null) {
      // If the key does not exist, return 0 as there are no sign-in counts.
      return 0;
    }

    // Now we can safely cast counts because we know it's not null.
    const stringCounts = counts as Record<string, string>;
    return Object.values(stringCounts).reduce((total, count) => {
      // Now TypeScript knows that 'count' is a string.
      return total + parseInt(count, 10);
    }, 0);
  } catch (error) {
    console.error(`Failed to get sign-in count for period ${dateKey}`, error);
    return 0;
  }
};



export const getDetailsByUser = async (dateKey: string): Promise<Record<string, number>> => {

  const redis = getRedisClient();
  if (!redis) {
    console.error('Redis client is not initialized.');
    return {};
  }

  try {
    const rawCounts = await redis.hgetall(`signin_count:${dateKey}`);
    const counts: Record<string, number> = {};

    // Check if rawCounts is not null before iterating
    if (rawCounts) {
      // Iterate over the entries and parse each value as an integer.
      for (const [key, value] of Object.entries(rawCounts)) {
        if (typeof value === 'string') {
          counts[key] = parseInt(value, 10);
        } else {
          console.error(`Value for key '${key}' is not a string: ${value}`);
          counts[key] = 0; // or handle this case as appropriate
        }
      }
    }

    return counts;
  } catch (error) {
    console.error(`Failed to get details by user for period ${dateKey}`, error);
    return {};
  }
};


