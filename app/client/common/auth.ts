import { getClientConfig } from "@/app/config/client";
import { ACCESS_CODE_PREFIX } from "@/app/constant";
import { useAccessStore } from "@/app/store";

export function bearer(value: string) {
  return `Bearer ${value.trim()}`;
}

export function getAuthKey(apiKey = "") {
  const accessStore = useAccessStore.getState();
  const isApp = !!getClientConfig()?.isApp;
  let authKey = "";

  if (apiKey) {
    // use user's api key first
    authKey = bearer(apiKey);
  } else if (
    accessStore.enabledAccessControl() &&
    !isApp &&
    !!accessStore.accessCode
  ) {
    // or use access code
    authKey = bearer(ACCESS_CODE_PREFIX + accessStore.accessCode);
  }

  return authKey;
}
