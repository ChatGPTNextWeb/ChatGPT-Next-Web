export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
