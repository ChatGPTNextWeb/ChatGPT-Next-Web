export function trimEnd(s: string, end = " ") {
  if (end.length === 0) return s;

  while (s.endsWith(end)) {
    s = s.slice(0, -end.length);
  }

  return s;
}

export function trimStart(s: string, start = " ") {
  if (start.length === 0) return s;

  while (s.endsWith(start)) {
    s = s.slice(start.length);
  }

  return s;
}
