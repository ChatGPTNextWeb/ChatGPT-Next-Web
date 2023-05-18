import { NextApiHandler, NextApiRequest } from "next";
import { NextRequest } from "next/server";
import { KVNamespace } from "@cloudflare/workers-types";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      history: KVNamespace;
    }
  }
}

const getKeyFromQuery = async (req: NextApiRequest) => {
  const { key } = req.query;
  if (key === undefined) {
    return { key: null, error: "key is undefined" };
  } else if (Array.isArray(key)) {
    return { key: null, error: "key is array" };
  } else {
    return { key, error: null };
  }
};

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key === null) {
    return new Response("key is null", { status: 400 });
  }
  const { history } = process.env;
  const historyString = await history.get(key);
  return new Response(historyString || "", {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const POST = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key === null) {
    return new Response("key is null", { status: 400 });
  }
  const { history } = process.env;
  await history.put(new Date().toISOString(), JSON.stringify(await req.json()));
  //   const body = await req.json();
  //   console.log(body);
  //   await history.put(key, JSON.stringify(body));
  return new Response("ok");
};

export const runtime = "edge";
