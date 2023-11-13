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
