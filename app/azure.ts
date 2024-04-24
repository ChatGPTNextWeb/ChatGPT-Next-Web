export function makeAzurePath(path: string, model: string, apiVersion: string) {
  // https://{resource-url}/openai/deployments/{deploy-id}

  // should omit /v1 prefix
  path = path.replaceAll("v1/", "");

  path = "openai/deployments/" + model + "/" + path;

  // should add api-key to query string
  path += `${path.includes("?") ? "&" : "?"}api-version=${apiVersion}`;

  return path;
}
