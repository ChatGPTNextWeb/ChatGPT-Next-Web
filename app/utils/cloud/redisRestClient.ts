// redisRestClient.ts
import fetch from 'node-fetch'; // or any other fetch-compatible API

const redisRestUrl = process.env.UPSTASH_REDIS_URL;
const redisRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisRestUrl || !redisRestToken) {
  console.error('The Upstash Redis URL and token must be provided.');
  // Handle the lack of Redis client here, e.g., by disabling certain features
}

const headers = {
  Authorization: `Bearer ${redisRestToken}`,
  'Content-Type': 'application/json',
};

export const incrementSignInCount = async (email: string | undefined, dateKey: string) => {
    if (!email) {
      console.error('Email is undefined, cannot increment sign-in count.');
      return;
    }
  
    const response = await fetch(`${redisRestUrl}/hincrby`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        key: `signin_count:${email}`,
        field: dateKey,
        increment: 1
      }),
    });
  
    if (!response.ok) {
      console.error('Failed to increment sign-in count in Redis via REST API');
    }
  };
  

export const incrementSessionRefreshCount = async (email: string | undefined, dateKey: string) => {
  if (!email) {
    console.error('Email is undefined, cannot increment session refresh count.');
    return;
  }

  const response = await fetch(`${redisRestUrl}/hincrby`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      key: `session_refreshes:${email}`,
      field: dateKey,
      increment: 1
    }),
  });

  if (!response.ok) {
    console.error('Failed to increment session refresh count in Redis via REST API');
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

  const incrementCompletionTokensResponse = await fetch(`${redisRestUrl}/hincrby`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      key: `tokens:${email}`,
      field: `${dateKey}:completion_tokens`,
      increment: completionTokens
    }),
  });

  const incrementPromptTokensResponse = await fetch(`${redisRestUrl}/hincrby`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      key: `tokens:${email}`,
      field: `${dateKey}:prompt_tokens`,
      increment: promptTokens
    }),
  });

  if (!incrementCompletionTokensResponse.ok) {
    console.error('Failed to increment completion token count in Redis via REST API');
  }

  if (!incrementPromptTokensResponse.ok) {
    console.error('Failed to increment prompt token count in Redis via REST API');
  }
};
