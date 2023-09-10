import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Updater } from "../typing";
import { deepClone } from "./clone";

type SecondParam<T> = T extends (
  _f: infer _F,
  _s: infer S,
  ...args: infer _U
) => any
  ? S
  : never;

type MakeUpdater<T> = {
  lastUpdateTime: number;

  markUpdate: () => void;
  update: Updater<T>;
};

type SetStoreState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined,
) => void;

export function createPersistStore<T, M>(
  defaultState: T,
  methods: (
    set: SetStoreState<T & MakeUpdater<T>>,
    get: () => T & MakeUpdater<T>,
  ) => M,
  persistOptions: SecondParam<typeof persist<T & M & MakeUpdater<T>>>,
) {
  return create<T & M & MakeUpdater<T>>()(
    persist((set, get) => {
      return {
        ...defaultState,
        ...methods(set as any, get),

        lastUpdateTime: 0,
        markUpdate() {
          set({ lastUpdateTime: Date.now() } as Partial<
            T & M & MakeUpdater<T>
          >);
        },
        update(updater) {
          const state = deepClone(get());
          updater(state);
          get().markUpdate();
          set(state);
        },
      };
    }, persistOptions),
  );
}
