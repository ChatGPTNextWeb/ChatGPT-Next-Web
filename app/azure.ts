export function makeAzurePath(path: string, apiVersion: string) {
  // should omit /v1 prefix
  path = path.replaceAll("v1/", "");

  // should add api-key to query string
  path += `${path.includes("?") ? "&" : "?"}api-version=${apiVersion}`;

  return path;
}

export function makeAzureBaseUrl(
  url: string,
  deploymentId: string | undefined,
) {
  const DEPLOYMENTS = "deployments";
  if (!deploymentId || url.indexOf(DEPLOYMENTS) == -1) {
    return url;
  }

  const end = url.indexOf(DEPLOYMENTS) + DEPLOYMENTS.length;
  return url.substring(0, end) + "/" + deploymentId;
}
