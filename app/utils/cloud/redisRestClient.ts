// redisRestClient.ts
import { Redis } from "@upstash/redis";

// Check if the environment variables are set
const redisUrl = process.env.UPSTASH_REDIS_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error('The Upstash Redis URL and token must be provided.');
}

// Create the Redis instance with the known-to-be-defined values
const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});


export const incrementSignInCount = async (email: string | undefined, dateKey: string) => {
  if (!email) {
    console.error('Email is undefined, cannot increment sign-in count.');
    return;
  }

  try {
    await redis.hincrby(`signin_count:${email}`, dateKey, 1);
  } catch (error) {
    console.error('Failed to increment sign-in count in Redis via Upstash', error);
  }
};

export const incrementSessionRefreshCount = async (email: string | undefined, dateKey: string) => {
  if (!email) {
    console.error('Email is undefined, cannot increment session refresh count.');
    return;
  }

  try {
    await redis.hincrby(`session_refreshes:${email}`, dateKey, 1);
  } catch (error) {
    console.error('Failed to increment session refresh count in Redis via Upstash', error);
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

  try {
    await redis.hincrby(`tokens:${email}`, `${dateKey}:completion_tokens`, completionTokens);
    await redis.hincrby(`tokens:${email}`, `${dateKey}:prompt_tokens`, promptTokens);
  } catch (error) {
    console.error('Failed to increment token counts in Redis via Upstash', error);
  }
};


export const getAvailableDateKeys = async (): Promise<string[]> => {
  try {
    const keys = await redis.keys('signin_count:*');
    return keys.map(key => key.split(':')[1]);
  } catch (error) {
    console.error('Failed to get keys from Redis', error);
    return [];
  }
};

export const getSignInCountForPeriod = async (dateKey: string): Promise<number> => {
  try {
    // Explicitly cast the result of redis.hgetall to an object with string values.
    const counts = await redis.hgetall(`signin_count:${dateKey}`) as Record<string, string>;
    return Object.values(counts).reduce((total, count) => {
      // Now TypeScript knows that 'count' is a string.
      return total + parseInt(count, 10);
    }, 0);
  } catch (error) {
    console.error(`Failed to get sign-in count for period ${dateKey}`, error);
    return 0;
  }
};



export const getDetailsByUser = async (dateKey: string): Promise<Record<string, number>> => {
  try {
    const rawCounts = await redis.hgetall(`signin_count:${dateKey}`);
    const counts: Record<string, number> = {};

    // Ensure that all values are numbers after parsing.
    for (const [key, value] of Object.entries(rawCounts)) {
      if (typeof value === 'string') {
        counts[key] = parseInt(value, 10);
      } else {
        console.error(`Value for key '${key}' is not a string: ${value}`);
        counts[key] = 0; // or handle this case as appropriate
      }
    }

    return counts;
  } catch (error) {
    console.error(`Failed to get details by user for period ${dateKey}`, error);
    return {};
  }
};


