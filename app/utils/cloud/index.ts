import { createWebDavClient } from "./webdav";
import { createUpstashClient } from "./upstash";
import { createGistClient } from "./gist";

export enum ProviderType {
  WebDAV = "webdav",
  UpStash = "upstash",
  GitHubGist = "githubGist",
}

export const SyncClients = {
  [ProviderType.UpStash]: createUpstashClient,
  [ProviderType.WebDAV]: createWebDavClient,
  [ProviderType.GitHubGist]: createGistClient,
} as const;

type SyncClientConfig = {
  [K in keyof typeof SyncClients]: (typeof SyncClients)[K] extends (
    _: infer C,
  ) => any
    ? C
    : never;
};

export type SyncClient = {
  get: (key: string) => Promise<string>;
  set: (key: string, value: Object | string) => Promise<void>; // Update the parameter type to accept both object and string
  check: () => Promise<boolean>;
};

export function createSyncClient<T extends keyof typeof SyncClients>(
  provider: T,
  config: SyncClientConfig[T],
): SyncClient {
  return SyncClients[provider](config as any) as any;
}
