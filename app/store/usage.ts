import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UsageStore {
  used: string;
  subscription: string;

  updateUsage: (used?: string, subscription?: string) => void;
  hasUsageData: () => boolean;
}

const USAGE_KEY = "api-usage";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      used: "",
      subscription: "",

      updateUsage(used?: string, subscription?: string) {
        set((state) => ({
          used: used ?? "[?]",
          subscription: subscription ?? "[?]",
        }));
      },
      hasUsageData() {
        const used = get().used;
        const sub = get().subscription;
        const hasUsed = used != "" && used != "[?]";
        const hasSubscription = sub != "" && sub != "[?]";
        return hasUsed && hasSubscription;
      },
    }),
    {
      name: USAGE_KEY,
      version: 1,
    },
  ),
);
