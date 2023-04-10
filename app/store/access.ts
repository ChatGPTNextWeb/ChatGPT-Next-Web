import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryMeta } from "../utils";

export interface AccessControlStore {
  accessCode: string;
  token: string;

  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  enabledAccessControl: () => boolean;
  isAuthorized: () => boolean;
}

export const ACCESS_KEY = "access-control";

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      enabledAccessControl() {
        return queryMeta("access") === "enabled";
      },
      updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set((state) => ({ token }));
      },
      isAuthorized() {
        // has token or has code or disabled access control
        return (
          !!get().token || !!get().accessCode || !get().enabledAccessControl()
        );
      },
    }),
    {
      name: ACCESS_KEY,
      version: 1,
    },
  ),
);
