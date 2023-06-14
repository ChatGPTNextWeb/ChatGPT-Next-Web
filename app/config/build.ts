export const getBuildConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const COMMIT_ID: string = (() => {
    try {
      const childProcess = require("child_process");
      return childProcess
        .execSync('git log -1 --format="%at000" --date=unix')
        .toString()
        .trim();
    } catch (e) {
      console.error("[Build Config] No git or not from git repo.");
      return "unknown";
    }
  })();

  return {
    commitId: COMMIT_ID,
    buildMode: process.env.BUILD_MODE ?? "standalone",
  };
};

export type BuildConfig = ReturnType<typeof getBuildConfig>;
