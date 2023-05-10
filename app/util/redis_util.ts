import { createClient } from "redis";
import { User } from "@/app/api/user/user";

const client = createClient({
  url: process.env.REDIS_HOST || "redis://localhost:6379",
});
client.on("error", (err) => console.log("Redis Client Error", err));

export async function verifyToken(key: string | null) {
  try {
    await client.connect();
    // console.log("[Danny Debug] key", key);
    if (key == null) {
      return false;
    }
    const value = await client.get(key);
    // console.log("[Danny Debug] value", value);
    if (value == null) {
      return false;
    }
    const user: User = JSON.parse(value);
    if (user.balance < 0) {
      return false;
    }
    return true;
  } finally {
    await client.disconnect();
  }
}

export async function deductTokenBalance(key: string) {
  try {
    await client.connect();
    const value = await client.get(key);
    if (value == null) {
      return -1;
    }
    const user: User = JSON.parse(value);
    const seconds = await client.ttl(key);

    user.balance = user.balance - 1;
    user.seconds = seconds;

    await client.setEx(key, seconds, JSON.stringify(user));
    return user;
  } finally {
    await client.disconnect();
  }
}

export async function initUser(key: string, value: string, seconds: number) {
  await client.connect();
  await client.setEx(key, seconds, value);
  await client.disconnect();
  return value;
}

export async function redisGet(key: string | null) {
  if (key == null) {
    return null;
  }
  await client.connect();
  const value = await client.get(key);
  await client.disconnect();
  return value;
}

export async function redisKeys() {
  await client.connect();
  const keys = await client.keys("*");
  await client.disconnect();
  return keys;
}

export async function getTTL(key: string) {
  await client.connect();
  const ttl = await client.ttl(key);
  await client.disconnect();
  return ttl;
}
