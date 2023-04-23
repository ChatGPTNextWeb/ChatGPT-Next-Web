import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  needCode: boolean;
  disableUserToken: boolean;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  accessControl: () => {
    needCode: boolean;
    disableUserToken: boolean;
  };
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
      needCode: true,
      disableUserToken: false,
      accessControl() {
        get().fetch();

        return {
          needCode: get().needCode,
          disableUserToken: get().disableUserToken,
        };
      },
      updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set((state) => ({ token }));
      },
      isAuthorized() {
        // has token or has code or disabled access control
        const accessControl = get().accessControl();
        return (
          !accessControl.needCode ||
          !!get().accessCode ||
          (!!get().token && !accessControl.disableUserToken)
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
