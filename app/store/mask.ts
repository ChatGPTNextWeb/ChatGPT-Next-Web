import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLang, Lang } from "../locales";
import { Message } from "./chat";
import { ModelConfig, useAppConfig } from "./config";

export const MASK_KEY = "mask-store";

export type Mask = {
  id: number;
  avatar: string;
  name: string;
  context: Message[];
  config: ModelConfig;
  lang: Lang;
};

export const DEFAULT_MASK_STATE = {
  masks: {} as Record<number, Mask>,
  globalMaskId: 0,
};

export type MaskState = typeof DEFAULT_MASK_STATE;
type MaskStore = MaskState & {
  create: (mask: Partial<Mask>) => Mask;
  update: (id: number, updater: (mask: Mask) => void) => void;
  delete: (id: number) => void;
  search: (text: string) => Mask[];
  getAll: () => Mask[];
};

export const useMaskStore = create<MaskStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_MASK_STATE,

      create(mask) {
        set(() => ({ globalMaskId: get().globalMaskId + 1 }));
        const id = get().globalMaskId;
        const masks = get().masks;
        masks[id] = {
          id,
          avatar: "1f916",
          name: "",
          config: useAppConfig.getState().modelConfig,
          context: [],
          lang: getLang(),
          ...mask,
        };

        set(() => ({ masks }));

        return masks[id];
      },
      update(id, updater) {
        const masks = get().masks;
        const mask = masks[id];
        if (!mask) return;
        const updateMask = { ...mask };
        updater(updateMask);
        masks[id] = updateMask;
        set(() => ({ masks }));
      },
      delete(id) {
        const masks = get().masks;
        delete masks[id];
        set(() => ({ masks }));
      },
      getAll() {
        return Object.values(get().masks).sort((a, b) => a.id - b.id);
      },
      search(text) {
        return Object.values(get().masks);
      },
    }),
    {
      name: MASK_KEY,
      version: 2,
    },
  ),
);
