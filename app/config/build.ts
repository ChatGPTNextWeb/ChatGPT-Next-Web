const COMMIT_ID: string = (() => {
  try {
    const childProcess = require("child_process");
    return (
      childProcess
        // .execSync("git describe --tags --abbrev=0")
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim()
    );
  } catch (e) {
    console.error("[Build Config] No git or not from git repo.");
    return "unknown";
  }
})();

export const getBuildConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  return {
    commitId: COMMIT_ID,
  };
};
