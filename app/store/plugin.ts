import OpenAPIClientAxios from "openapi-client-axios";
import { getLang, Lang } from "../locales";
import { StoreKey, Plugin } from "../constant";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import yaml from "js-yaml";

export type Plugin = {
  id: string;
  createdAt: number;
  title: string;
  version: string;
  context: string;
  builtin: boolean;
};

export const createEmptyPlugin = () =>
  ({
    id: nanoid(),
    title: "",
    version: "",
    context: "",
    builtin: false,
    createdAt: Date.now(),
  }) as Plugin;

export const DEFAULT_PLUGIN_STATE = {
  plugins: {} as Record<string, Plugin>,
};

export const usePluginStore = createPersistStore(
  { ...DEFAULT_PLUGIN_STATE },

  (set, get) => ({
    create(plugin?: Partial<Plugin>) {
      const plugins = get().plugins;
      const id = nanoid();
      plugins[id] = {
        ...createEmptyPlugin(),
        ...plugin,
        id,
        builtin: false,
      };

      set(() => ({ plugins }));
      get().markUpdate();

      return plugins[id];
    },
    updatePlugin(id: string, updater: (plugin: Plugin) => void) {
      const plugins = get().plugins;
      const plugin = plugins[id];
      if (!plugin) return;
      const updatePlugin = { ...plugin };
      updater(updatePlugin);
      plugins[id] = updatePlugin;
      set(() => ({ plugins }));
      get().markUpdate();
    },
    delete(id: string) {
      const plugins = get().plugins;
      delete plugins[id];
      set(() => ({ plugins }));
      get().markUpdate();
    },

    getAsTools(ids: string[]) {
      const plugins = get().plugins;
      const selected = ids
        .map((id) => plugins[id])
        .filter((i) => i)
        .map((i) => [
          i,
          new OpenAPIClientAxios({ definition: yaml.load(i.content) }),
        ])
        .map(([item, api]) => {
          api.initSync();
          const operations = api.getOperations().map((o) => {
            const parameters = o.parameters;
            return [
              {
                type: "function",
                function: {
                  name: o.operationId,
                  description: o.description,
                  parameters: o.parameters,
                },
              },
              api.client[o.operationId],
            ];
            // return [{
            // }, function(arg) {
            //   const args = []
            //   for (const p in parameters) {
            //     if (p.type === "object") {
            //       const a = {}
            //       for (const n of p.)
            //     }
            //   }
            // }]
          });
          return [item, api, operations];
        });
      console.log("selected", selected);
      const result = selected.reduce((s, i) => s.concat(i[2]), []);
      return [
        result.map(([t, _]) => t),
        result.reduce((s, i) => {
          s[i[0].function.name] = i[1];
          return s;
        }, {}),
      ];
    },
    get(id?: string) {
      return get().plugins[id ?? 1145141919810];
    },
    getAll() {
      return Object.values(get().plugins).sort(
        (a, b) => b.createdAt - a.createdAt,
      );
    },
  }),
  {
    name: StoreKey.Plugin,
    version: 1,
  },
);
