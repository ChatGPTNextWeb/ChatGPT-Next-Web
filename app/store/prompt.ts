import Fuse from "fuse.js";
import { getLang } from "../locales";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";

export interface Prompt {
  id: string;
  isUser?: boolean;
  title: string;
  content: string;
  createdAt: number;
}

export const SearchService = {
  ready: false,
  builtinEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  userEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  gptEngine: new Fuse<Prompt>([], { keys: ["title"] }),
  count: {
    builtin: 0,
  },
  allPrompts: [] as Prompt[],
  builtinPrompts: [] as Prompt[],

  init(builtinPrompts: Prompt[], userPrompts: Prompt[], gptPrompts?: Prompt[]) {
    if (this.ready) {
      return;
    }
    const _gptPrompts = gptPrompts ?? [];

    this.allPrompts = userPrompts.concat(builtinPrompts).concat(_gptPrompts);
    this.builtinPrompts = builtinPrompts.slice();
    this.builtinEngine.setCollection(builtinPrompts);
    this.userEngine.setCollection(userPrompts);
    this.gptEngine.setCollection(_gptPrompts);
    this.ready = true;
  },

  remove(id: string) {
    this.userEngine.remove((doc) => doc.id === id);
  },

  add(prompt: Prompt) {
    this.userEngine.add(prompt);
  },

  search(text: string) {
    if (text.startsWith("mj")) {
      return [];
    }
    const userResults = this.userEngine.search(text);
    const builtinResults = this.builtinEngine.search(text);
    const gptResults = this.gptEngine.search(text);
    return userResults
      .concat(builtinResults)
      .concat(gptResults)
      .map((v) => v.item);
  },
};

export const usePromptStore = createPersistStore(
  {
    counter: 0,
    prompts: {} as Record<string, Prompt>,
  },

  (set, get) => ({
    add(prompt: Prompt) {
      const prompts = get().prompts;
      prompt.id = nanoid();
      prompt.isUser = true;
      prompt.createdAt = Date.now();
      prompts[prompt.id] = prompt;

      set(() => ({
        prompts: prompts,
      }));

      return prompt.id!;
    },

    get(id: string) {
      const targetPrompt = get().prompts[id];

      if (!targetPrompt) {
        return SearchService.builtinPrompts.find((v) => v.id === id);
      }

      return targetPrompt;
    },

    remove(id: string) {
      const prompts = get().prompts;
      delete prompts[id];

      Object.entries(prompts).some(([key, prompt]) => {
        if (prompt.id === id) {
          delete prompts[key];
          return true;
        }
        return false;
      });

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

    updatePrompt(id: string, updater: (prompt: Prompt) => void) {
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

    search(text: string) {
      if (text.length === 0) {
        // return all rompts
        return this.getUserPrompts().concat(SearchService.builtinPrompts);
      }
      return SearchService.search(text) as Prompt[];
    },
  }),
  {
    name: StoreKey.Prompt,
    version: 3,

    migrate(state, version) {
      const newState = JSON.parse(JSON.stringify(state)) as {
        prompts: Record<string, Prompt>;
      };

      if (version < 3) {
        Object.values(newState.prompts).forEach((p) => (p.id = nanoid()));
      }

      return newState as any;
    },

    onRehydrateStorage(state) {
      // const PROMPT_URL = "https://cos.xiaosi.cc/next/public/prompts.json";
      const PROMPT_URL = "https://oss.xiaosi.cc/chat/public/prompts.json";
      const GPT_PROMPT_URL =
        "https://oss.xiaosi.cc/chat/public/prompt_library.json";

      type PromptList = Array<[string, string]>;

      fetch(PROMPT_URL)
        .then((res) => res.json())
        .then((res) => {
          let fetchPrompts = [res.en, res.cn];
          if (getLang() === "cn") {
            fetchPrompts = fetchPrompts.reverse();
          }
          const builtinPrompts = fetchPrompts.map((promptList: PromptList) => {
            return promptList.map(
              ([title, content]) =>
                ({
                  id: nanoid(),
                  title,
                  content,
                  createdAt: Date.now(),
                }) as Prompt,
            );
          });
          // let gptPrompts: Prompt[] = [];
          try {
            fetch(GPT_PROMPT_URL)
              .then((res2) => res2.json())
              .then((res2) => {
                const gptPrompts: Prompt[] = res2["items"].map(
                  (prompt: {
                    id: string;
                    title: string;
                    description: string;
                    prompt: string;
                    category: string;
                  }) => {
                    return {
                      id: prompt["id"],
                      title: prompt["title"],
                      content: prompt["prompt"],
                      createdAt: Date.now(),
                    };
                  },
                );
                const userPrompts =
                  usePromptStore.getState().getUserPrompts() ?? [];
                const allPromptsForSearch = builtinPrompts
                  .reduce((pre, cur) => pre.concat(cur), [])
                  .filter((v) => !!v.title && !!v.content);
                SearchService.count.builtin =
                  res.en.length + res.cn.length + res["total"];
                SearchService.init(
                  allPromptsForSearch,
                  userPrompts,
                  gptPrompts,
                );
              });
          } catch (e) {
            console.log("[gpt prompt]", e);
            const userPrompts =
              usePromptStore.getState().getUserPrompts() ?? [];
            const allPromptsForSearch = builtinPrompts
              .reduce((pre, cur) => pre.concat(cur), [])
              .filter((v) => !!v.title && !!v.content);
            SearchService.count.builtin = res.en.length + res.cn.length;
            SearchService.init(allPromptsForSearch, userPrompts);
          }
        });
    },
  },
);
