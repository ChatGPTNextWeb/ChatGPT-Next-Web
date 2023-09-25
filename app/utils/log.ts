export function createLogger(prefix = "") {
  return {
    log(...args: any[]) {
      console.log(prefix, ...args);
    },
    error(...args: any[]) {
      console.error(prefix, ...args);
    },
    warn(...args: any[]) {
      console.warn(prefix, ...args);
    },
  };
}
