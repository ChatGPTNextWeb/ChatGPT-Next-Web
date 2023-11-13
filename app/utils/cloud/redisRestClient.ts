// redisRestClient.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

if (!redis.url || !redis.token) {
  console.error('The Upstash Redis URL and token must be provided.');
  // Handle the lack of Redis client here, e.g., by disabling certain features
}

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
