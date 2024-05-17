export function makeAzurePath(path: string, apiVersion: string) {
  // should omit /v1 prefix
  path = path.replaceAll("v1/", "");

  // should add api-key to query string
  path += `${path.includes("?") ? "&" : "?"}api-version=${apiVersion}`;

  return path;
}

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

export const makeBearer = (s: string) => `Bearer ${s.trim()}`;
export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);
