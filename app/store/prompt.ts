import { create } from "zustand";
import { persist } from "zustand/middleware";
import JsSearch from "js-search";

export interface Prompt {
  id?: number;
  shortcut: string;
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
  progress: 0, // 0 - 1, 1 means ready
  engine: new JsSearch.Search("prompts"),
  deleted: new Set<number>(),

  async init(prompts: PromptStore["prompts"]) {
    this.engine.addIndex("id");
    this.engine.addIndex("shortcut");
    this.engine.addIndex("title");

    const n = prompts.size;
    let count = 0;
    for await (const prompt of prompts.values()) {
      this.engine.addDocument(prompt);
      count += 1;
      this.progress = count / n;
    }
    this.ready = true;
  },

  remove(id: number) {
    this.deleted.add(id);
  },

  add(prompt: Prompt) {
    this.engine.addDocument(prompt);
  },

  search(text: string) {
    const results = this.engine.search(text) as Prompt[];
    return results.filter((v) => !v.id || !this.deleted.has(v.id));
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
    }
  )
);
