import { NextApiHandler, NextApiRequest } from "next";
import { NextRequest } from "next/server";

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

export const GET: NextApiHandler = async (req, rep) => {
  const { history } = process.env;
  const { key, error } = await getKeyFromQuery(req);
  if (error !== null) {
    return rep.json({ error });
  }
  const historyString = await history.get(key);
  return rep.json({ data: JSON.parse(historyString || "") });
};

export const POST: NextApiHandler = async (req, rep) => {
  const { history } = process.env;
  const { key, error } = await getKeyFromQuery(req);
  if (error !== null) {
    return rep.json({ error });
  }
  await history.put(key, JSON.stringify(req.body));
  return rep.json({ data: req.body });
};
