export function makeAzurePath(
  path: string,
  apiVersion: string,
  azureModel?: string,
) {
  // should omit /v1 prefix
  // path = path.replaceAll("v1/", "");
  path = path.replaceAll(
    "v1/chat/completions",
    `openai/deployments/${azureModel}/chat/completions`,
  );
  // should add api-key to query string
  path += `${path.includes("?") ? "&" : "?"}api-version=${apiVersion}`;

  return path;
}
