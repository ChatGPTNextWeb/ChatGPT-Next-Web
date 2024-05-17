export const makeBearer = (s: string) => `Bearer ${s.trim()}`;
export const validString = (x?: string): x is string =>
  Boolean(x && x.length > 0);

export function ensureProperEnding(str: string) {
  if (str.startsWith("[") && !str.endsWith("]")) {
    return str + "]";
  }
  return str;
}
