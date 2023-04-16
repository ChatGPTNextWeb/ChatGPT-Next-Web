import { create } from "zustand";
import { persist } from "zustand/middleware";
import Fuse from "fuse.js";
import { getLang } from "../locales";

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
  allBuiltInPrompts: [] as Prompt[],

  init(prompts: Prompt[]) {
    if (this.ready) {
      return;
    }
    this.allBuiltInPrompts = prompts;
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
        if (text.length === 0) {
          // return all prompts
          const userPrompts = get().prompts?.values?.() ?? [];
          return SearchService.allBuiltInPrompts.concat([...userPrompts]);
        }
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
            let fetchPrompts = [res.en, res.cn];
            if (getLang() === "cn") {
              fetchPrompts = fetchPrompts.reverse();
            }
            const builtinPrompts = fetchPrompts
              .map((promptList: PromptList) => {
                return promptList.map(
                  ([title, content]) =>
                    ({
                      title,
                      content,
                    } as Prompt),
                );
              })
              .concat([...(state?.prompts?.values() ?? [])]);

            const allPromptsForSearch = builtinPrompts
              .reduce((pre, cur) => pre.concat(cur), [])
              .filter((v) => !!v.title && !!v.content);
            SearchService.count.builtin = res.en.length + res.cn.length;
            SearchService.init(allPromptsForSearch);
          });
      },
    },
  ),
);
