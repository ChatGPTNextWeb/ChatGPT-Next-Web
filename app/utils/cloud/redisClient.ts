// redisClient.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.UPSTASH_REDIS_URL);

export const incrementSignInCount = async (email: string | undefined, dateKey: string) => {
  if (!email) {
    console.error('Email is undefined, cannot increment sign-in count.');
    return;
  }
  await redis.hincrby(`sign_ins:${email}`, dateKey, 1);
};

export const incrementSessionRefreshCount = async (email: string | undefined, dateKey: string) => {
  if (!email) {
    console.error('Email is undefined, cannot increment session refresh count.');
    return;
  }
  await redis.hincrby(`session_refreshes:${email}`, dateKey, 1);
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
  await redis.hincrby(`tokens:${email}`, `${dateKey}:completion_tokens`, completionTokens);
  await redis.hincrby(`tokens:${email}`, `${dateKey}:prompt_tokens`, promptTokens);
};
