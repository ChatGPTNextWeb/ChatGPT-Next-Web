(async () => {
  const config = await import("../next.config.mjs");
  console.log(config.default.experimental.appDir);
})();
