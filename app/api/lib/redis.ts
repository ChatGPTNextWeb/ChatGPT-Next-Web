import { assert } from "console";
import { Redis } from "ioredis";
import { getServerSideConfig } from "../../config/server";

const redis = new Redis(getServerSideConfig().redisUrl);

const keyOf = (accessCode: string) => `token:${accessCode}`;

export async function recordTokenUsage(
  accessCode: string,
  promptTokens: number,
  completionTokens: number,
) {
  const key = keyOf(accessCode);
  let res = await redis
    .multi()
    .call("JSON.NUMINCRBY", key, "$.usage.prompt", promptTokens)
    .call("JSON.NUMINCRBY", key, "$.usage.completion", completionTokens)
    .exec();
  return res;
}

export async function countDownToken(accessCode: string, tokenCount: number) {
  assert(tokenCount > 0);
  console.log("[Token] count down token ", accessCode, " count: ", tokenCount);
  const res = await redis.call(
    "JSON.NUMINCRBY",
    keyOf(accessCode),
    "$.remain",
    -tokenCount,
  );
}

type TokenInfo = {
  usage: { prompt: number; completion: number };
  total?: number;
  expire?: number;
};
export async function getTokenInfo(
  accessCode: string,
): Promise<TokenInfo | undefined> {
  const key = keyOf(accessCode);

  const obj = await redis.call("JSON.GET", key, "$").then((s) => {
    if (s !== null) {
      return JSON.parse(s as string)[0];
    }
  });

  if (obj && (obj?.total ?? 0) > 0 && !obj.usage) {
    const initUsage = { prompt: 0, completion: 0 };
    console.log("[Redis] Intialize usage for ", accessCode);
    await redis.call("JSON.SET", key, "$.usage", JSON.stringify(initUsage));
    obj["usage"] = initUsage;
  }
  return obj as TokenInfo;
}
