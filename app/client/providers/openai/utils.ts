export const makeBearer = (s: string) => `Bearer ${s.trim()}`;

export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);

export function prettyObject(msg: any) {
  const obj = msg;
  if (typeof msg !== "string") {
    msg = JSON.stringify(msg, null, "  ");
  }
  if (msg === "{}") {
    return obj.toString();
  }
  if (msg.startsWith("```json")) {
    return msg;
  }
  return ["```json", msg, "```"].join("\n");
}
