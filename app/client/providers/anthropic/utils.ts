export function trimEnd(s: string, end = " ") {
  if (end.length === 0) return s;

  while (s.endsWith(end)) {
    s = s.slice(0, -end.length);
  }

  return s;
}

export function bearer(value: string) {
  return `Bearer ${value.trim()}`;
}

export function getAuthKey(apiKey = "") {
  let authKey = "";

  if (apiKey) {
    // use user's api key first
    authKey = bearer(apiKey);
  }

  return authKey;
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
