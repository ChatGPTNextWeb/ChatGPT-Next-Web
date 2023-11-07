import { REMOTE_API_HOST, StoreKey } from "../constant";
import { getClientConfig } from "../config/client";
import { createPersistStore } from "../utils/store";
import { getAuthKey } from "../client/common/auth";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

const DEFAULT_OPENAI_URL =
  getClientConfig()?.buildMode === "export" ? REMOTE_API_HOST : "/api/openai/";
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

const DEFAULT_ACCESS_STATE = {
  accessCode: "",
  needCode: true,
  hideUserApiKey: false,
  hideBalanceQuery: false,
  disableGPT4: false,
};

export const useAccessStore = createPersistStore(
  { ...DEFAULT_ACCESS_STATE },

  (set, get) => ({
    enabledAccessControl() {
      this.fetchConfig();

      return get().needCode;
    },
    isAuthorized() {
      this.fetchConfig();

      // has token or has code or disabled access control
      return !!get().accessCode || !this.enabledAccessControl();
    },
    fetchConfig() {
      if (fetchState > 0 || getClientConfig()?.buildMode === "export") return;
      fetchState = 1;
      fetch("/api/config", {
        method: "post",
        body: null,
        headers: {
          Authorization: getAuthKey(),
        },
      })
        .then((res) => res.json())
        .then((res: DangerConfig) => {
          console.log("[Config] got config from server", res);
          set(() => ({ ...res }));

          if (res.disableGPT4) {
            // disable model
          }
        })
        .catch(() => {
          console.error("[Config] failed to fetch config");
        })
        .finally(() => {
          fetchState = 2;
        });
    },
  }),
  {
    name: StoreKey.Access,
    version: 1,
  },
);
