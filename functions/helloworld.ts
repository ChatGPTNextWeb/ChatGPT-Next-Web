interface Env {
  KV: KVNamespace;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const value = await context.env.KV.get("chatgpt");
  return new Response(value);
};
