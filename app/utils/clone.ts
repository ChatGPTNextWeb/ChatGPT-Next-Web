export function deepClone<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj));
}

export function ensure<T extends object>(
  obj: T,
  keys: Array<[keyof T][number]>,
) {
  return keys.every(
    (k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== "",
  );
}
