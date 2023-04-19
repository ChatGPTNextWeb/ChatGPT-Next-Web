import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  enableAOAI: boolean;
  azureDeployName: string;

  needCode: boolean;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  updateDeployName: (_: string) => void;
  switchAOAI: (_: boolean) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
  fetch: () => void;
}

export const ACCESS_KEY = "access-control";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      azureDeployName: "",
      enableAOAI: false,
      needCode: true,
      enabledAccessControl() {
        get().fetch();

        return get().needCode;
      },
      updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set((state) => ({ token }));
      },
      updateDeployName(azureDeployName: string) {
        set((state) => ({ azureDeployName }));
      },
      switchAOAI(switchStatus: boolean) {
        set((state) => ({ enableAOAI: switchStatus }));
      },
      isAuthorized() {
        // has token or has code or disabled access control
        if (get().enableAOAI) {
          return !!get().azureDeployName && !!get().token;
        }

        return (
          !!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },
      fetch() {
        if (fetchState > 0) return;
        fetchState = 1;
        fetch("/api/config", {
          method: "post",
          body: null,
        })
          .then((res) => res.json())
          .then((res: DangerConfig) => {
            console.log("[Config] got config from server", res);
            set(() => ({ ...res }));
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
      name: ACCESS_KEY,
      version: 1,
    },
  ),
);
