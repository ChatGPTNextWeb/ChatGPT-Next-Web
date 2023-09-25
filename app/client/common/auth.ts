import { getClientConfig } from "@/app/config/client";
import { ACCESS_CODE_PREFIX } from "@/app/constant";
import { useAccessStore } from "@/app/store";

export function bearer(value: string) {
  return `Bearer ${value.trim()}`;
}

export function getAuthHeaders(apiKey = "") {
  const accessStore = useAccessStore.getState();
  const isApp = !!getClientConfig()?.isApp;

  let headers: Record<string, string> = {};

  if (apiKey) {
    // use user's api key first
    headers.Authorization = bearer(apiKey);
  } else if (
    accessStore.enabledAccessControl() &&
    !isApp &&
    !!accessStore.accessCode
  ) {
    // or use access code
    headers.Authorization = bearer(ACCESS_CODE_PREFIX + accessStore.accessCode);
  }

  return headers;
}
