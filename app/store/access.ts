import { create } from "zustand";
import { persist } from "zustand/middleware";
import { queryMeta } from "../utils";

export interface AccessControlStore {
  accessCode: string;
  token: string;
  host: string;

  updateHost: (_: string) => void;
  updateToken: (_: string) => void;
  updateCode: (_: string) => void;
  enabledAccessControl: () => boolean;
}

export const ACCESS_KEY = "access-control";

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      host: "",
      enabledAccessControl() {
        return queryMeta("access") === "enabled";
      },
      updateCode(code: string) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token: string) {
        set((state) => ({ token }));
      },
      updateHost(host: string) {
        set((state) => ({ host }));
      },
    }),
    {
      name: ACCESS_KEY,
      version: 1,
    },
  ),
);
