import { create } from "zustand";
import { persist } from "zustand/middleware";
import Fuse from "fuse.js";
import { getLang } from "../locales";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";

export interface Prompt {
  id: string;
  isUser?: boolean;
  title: string;
  content: string;
  createdAt: number;
}

export interface PromptStore {
  counter: number;
  prompts: Record<string, Prompt>;

  add: (prompt: Prompt) => string;
  get: (id: string) => Prompt | undefined;
  remove: (id: string) => void;
  search: (text: string) => Prompt[];
  update: (id: string, updater: (prompt: Prompt) => void) => void;

  getUserPrompts: () => Prompt[];
}

export const SearchService = {
  ready: false,
  builtinEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  userEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  count: {
    builtin: 0,
  },
  allPrompts: [] as Prompt[],
  builtinPrompts: [] as Prompt[],

  init(builtinPrompts: Prompt[], userPrompts: Prompt[]) {
    if (this.ready) {
      return;
    }
    this.allPrompts = userPrompts.concat(builtinPrompts);
    this.builtinPrompts = builtinPrompts.slice();
    this.builtinEngine.setCollection(builtinPrompts);
    this.userEngine.setCollection(userPrompts);
    this.ready = true;
  },

  remove(id: string) {
    this.userEngine.remove((doc) => doc.id === id);
  },

  add(prompt: Prompt) {
    this.userEngine.add(prompt);
  },

  search(text: string) {
    const userResults = this.userEngine.search(text);
    const builtinResults = this.builtinEngine.search(text);
    return userResults.concat(builtinResults).map((v) => v.item);
  },
};

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      counter: 0,
      latestId: 0,
      prompts: {},

      add(prompt) {
        const prompts = get().prompts;
        prompt.id = nanoid();
        prompt.isUser = true;
        prompt.createdAt = Date.now();
        prompts[prompt.id] = prompt;

        set(() => ({
          latestId: prompt.id!,
          prompts: prompts,
        }));

        return prompt.id!;
      },

      get(id) {
        const targetPrompt = get().prompts[id];

        if (!targetPrompt) {
          return SearchService.builtinPrompts.find((v) => v.id === id);
        }

        return targetPrompt;
      },

      remove(id) {
        const prompts = get().prompts;
        delete prompts[id];
        SearchService.remove(id);

        set(() => ({
          prompts,
          counter: get().counter + 1,
        }));
      },

      getUserPrompts() {
        const userPrompts = Object.values(get().prompts ?? {});
        userPrompts.sort((a, b) =>
          b.id && a.id ? b.createdAt - a.createdAt : 0,
        );
        return userPrompts;
      },

      update(id, updater) {
        const prompt = get().prompts[id] ?? {
          title: "",
          content: "",
          id,
        };

        SearchService.remove(id);
        updater(prompt);
        const prompts = get().prompts;
        prompts[id] = prompt;
        set(() => ({ prompts }));
        SearchService.add(prompt);
      },

      search(text) {
        if (text.length === 0) {
          // return all rompts
          return get().getUserPrompts().concat(SearchService.builtinPrompts);
        }
        return SearchService.search(text) as Prompt[];
      },
    }),
    {
      name: StoreKey.Prompt,
      version: 3,

      migrate(state, version) {
        const newState = JSON.parse(JSON.stringify(state)) as PromptStore;

        if (version < 3) {
          Object.values(newState.prompts).forEach((p) => (p.id = nanoid()));
        }

        return newState;
      },

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
            const builtinPrompts = fetchPrompts.map(
              (promptList: PromptList) => {
                return promptList.map(
                  ([title, content]) =>
                    ({
                      id: nanoid(),
                      title,
                      content,
                      createdAt: Date.now(),
                    } as Prompt),
                );
              },
            );

            const userPrompts =
              usePromptStore.getState().getUserPrompts() ?? [];

            const allPromptsForSearch = builtinPrompts
              .reduce((pre, cur) => pre.concat(cur), [])
              .filter((v) => !!v.title && !!v.content);
            SearchService.count.builtin = res.en.length + res.cn.length;
            SearchService.init(allPromptsForSearch, userPrompts);
          });
      },
    },
  ),
);
