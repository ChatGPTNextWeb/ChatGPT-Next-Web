import { create } from "zustand";
import { persist } from "zustand/middleware";
import Fuse from "fuse.js";

export interface Prompt {
  id?: number;
  title: string;
  content: string;
}

export interface PromptStore {
  latestId: number;
  prompts: Map<number, Prompt>;

  add: (prompt: Prompt) => number;
  remove: (id: number) => void;
  search: (text: string) => Prompt[];
}

export const PROMPT_KEY = "prompt-store";

export const SearchService = {
  ready: false,
  engine: new Fuse<Prompt>([], { keys: ["title"] }),
  count: {
    builtin: 0,
  },

  init(prompts: Prompt[]) {
    if (this.ready) {
      return;
    }
    this.engine.setCollection(prompts);
    this.ready = true;
  },

  remove(id: number) {
    this.engine.remove((doc) => doc.id === id);
  },

  add(prompt: Prompt) {
    this.engine.add(prompt);
  },

  search(text: string) {
    const results = this.engine.search(text);
    return results.map((v) => v.item);
  },
};

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      latestId: 0,
      prompts: new Map(),

      add(prompt) {
        const prompts = get().prompts;
        prompt.id = get().latestId + 1;
        prompts.set(prompt.id, prompt);

        set(() => ({
          latestId: prompt.id!,
          prompts: prompts,
        }));

        return prompt.id!;
      },

      remove(id) {
        const prompts = get().prompts;
        prompts.delete(id);
        SearchService.remove(id);

        set(() => ({
          prompts,
        }));
      },

      search(text) {
        return SearchService.search(text) as Prompt[];
      },
    }),
    {
      name: PROMPT_KEY,
      version: 1,
      onRehydrateStorage(state) {
        const PROMPT_URL = "./prompts.json";

        type PromptList = Array<[string, string]>;

        fetch(PROMPT_URL)
          .then((res) => res.json())
          .then((res) => {
            const builtinPrompts = [res.en, res.cn]
              .map((promptList: PromptList) => {
                return promptList.map(
                  ([title, content]) =>
                    ({
                      title,
                      content,
                    } as Prompt)
                );
              })
              .concat([...(state?.prompts?.values() ?? [])]);

            const allPromptsForSearch = builtinPrompts.reduce(
              (pre, cur) => pre.concat(cur),
              []
            );
            SearchService.count.builtin = res.en.length + res.cn.length;
            SearchService.init(allPromptsForSearch);
          });
      },
    }
  )
);
