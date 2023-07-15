export function merge(target: any, source: any) {
  Object.keys(source).forEach(function (key) {
    if (source[key] && typeof source[key] === "object") {
      merge((target[key] = target[key] || {}), source[key]);
      return;
    }
    target[key] = source[key];
  });
}
