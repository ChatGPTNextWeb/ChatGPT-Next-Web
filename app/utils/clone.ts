export function deepClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj));
}
