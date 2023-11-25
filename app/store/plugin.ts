import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUILTIN_PLUGIN_STORE, BUILTIN_PLUGINS } from "../plugins";
import { getLang, Lang } from "../locales";
import { DEFAULT_TOPIC, ChatMessage } from "./chat";
import { ModelConfig, useAppConfig } from "./config";
import { StoreKey } from "../constant";
import { nanoid } from "nanoid";

export type Plugin = {
  id: string;
  createdAt: number;
  name: string;
  toolName?: string;
  lang: string;
  description: string;
  builtin: boolean;
  enable: boolean;
  onlyNodeRuntime: boolean;
};

export const DEFAULT_PLUGIN_STATE = {
  plugins: {} as Record<string, Plugin>,
  pluginStatuses: {} as Record<string, boolean>,
};

export type PluginState = typeof DEFAULT_PLUGIN_STATE;
type PluginStore = PluginState & {
  create: (plugin?: Partial<Plugin>) => Plugin;
  update: (id: string, updater: (plugin: Plugin) => void) => void;
  enable: (id: string) => void;
  disable: (id: string) => void;
  delete: (id: string) => void;
  search: (text: string) => Plugin[];
  get: (id?: string) => Plugin | null;
  getAll: () => Plugin[];
};

export const createEmptyPlugin = () =>
  ({
    id: nanoid(),
    name: DEFAULT_TOPIC,
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
    enable: true,
  }) as Plugin;

export const usePluginStore = create<PluginStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PLUGIN_STATE,

      create(plugin) {
        const plugins = get().plugins;
        const id = nanoid();
        plugins[id] = {
          ...createEmptyPlugin(),
          ...plugin,
          id,
          builtin: false,
        };

        set(() => ({ plugins }));

        return plugins[id];
      },
      update(id, updater) {
        const plugins = get().plugins;
        const plugin = plugins[id];
        if (!plugin) return;
        const updatePlugin = { ...plugin };
        updater(updatePlugin);
        plugins[id] = updatePlugin;
        set(() => ({ plugins }));
      },
      delete(id) {
        const plugins = get().plugins;
        delete plugins[id];
        set(() => ({ plugins }));
      },
      enable(id) {
        const pluginStatuses = get().pluginStatuses;
        pluginStatuses[id] = true;
        set(() => ({ pluginStatuses }));
      },
      disable(id) {
        const pluginStatuses = get().pluginStatuses;
        pluginStatuses[id] = false;
        set(() => ({ pluginStatuses }));
      },
      get(id) {
        return get().plugins[id ?? 1145141919810];
      },
      getAll() {
        const userPlugins = Object.values(get().plugins).sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        const buildinPlugins = BUILTIN_PLUGINS.map(
          (m) =>
            ({
              ...m,
            }) as Plugin,
        );
        const pluginStatuses = get().pluginStatuses;
        return userPlugins.concat(buildinPlugins).map((e) => {
          e.enable = pluginStatuses[e.id] ?? e.enable;
          return e;
        });
      },
      search(text) {
        return Object.values(get().plugins);
      },
    }),
    {
      name: StoreKey.Plugin,
      version: 3.1,

      migrate(state, version) {
        const newState = JSON.parse(JSON.stringify(state)) as PluginState;

        if (version < 3) {
          Object.values(newState.plugins).forEach((m) => (m.id = nanoid()));
        }

        if (version < 3.1) {
          const updatedPlugins: Record<string, Plugin> = {};
          Object.values(newState.plugins).forEach((m) => {
            updatedPlugins[m.id] = m;
          });
          newState.plugins = updatedPlugins;
        }

        return newState as any;
      },
    },
  ),
);
