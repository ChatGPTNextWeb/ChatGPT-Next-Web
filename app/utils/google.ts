// Google carries the api version in the first path segment, and the version we
// send is part of Google.ChatPath:
// https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent
// document: https://ai.google.dev/api/rest
const API_VERSION = /^v\d+[a-z0-9]*$/;

export function dedupeGoogleApiVersion(fetchUrl: string) {
  // when a custom endpoint already points at an api version, use that one
  // instead of requesting ".../v1/v1beta/models/...", which is a 404
  const paths = fetchUrl.split("/");
  const version = paths.findIndex((path) => API_VERSION.test(path));
  // paths[2] is the host of an absolute url, not an api version
  if (version > 2 && API_VERSION.test(paths[version + 1])) {
    paths.splice(version + 1, 1);
    return paths.join("/");
  }
  return fetchUrl;
}
