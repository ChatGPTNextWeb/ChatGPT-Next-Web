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
  content: string;
  builtin: boolean;
};

export type FunctionToolItem = {
  type: string;
  function: {
    name: string;
    description?: string;
    parameters: Object;
  };
};

type FunctionToolServiceItem = {
  api: OpenAPIClientAxios;
  tools: FunctionToolItem[];
  funcs: Function[];
};

export const FunctionToolService = {
  tools: {} as Record<string, FunctionToolServiceItem>,
  add(plugin: Plugin, replace = false) {
    if (!replace && this.tools[plugin.id]) return this.tools[plugin.id];
    const api = new OpenAPIClientAxios({
      definition: yaml.load(plugin.content),
    });
    console.log("add", plugin, api);
    try {
      api.initSync();
    } catch (e) {}
    const operations = api.getOperations();
    return (this.tools[plugin.id] = {
      api,
      length: operations.length,
      tools: operations.map((o) => {
        const parameters = o?.requestBody?.content["application/json"]
          ?.schema || {
          type: "object",
          properties: {},
        };
        if (!parameters["required"]) {
          parameters["required"] = [];
        }
        if (o.parameters instanceof Array) {
          o.parameters.forEach((p) => {
            if (p.in == "query" || p.in == "path") {
              // const name = `${p.in}__${p.name}`
              const name = p.name;
              console.log("p", p, p.schema);
              parameters["properties"][name] = {
                type: p.schema.type,
                description: p.description,
              };
              if (p.required) {
                parameters["required"].push(name);
              }
            }
          });
        }
        return {
          type: "function",
          function: {
            name: o.operationId,
            description: o.description,
            parameters: parameters,
          },
        };
      }),
      funcs: operations.reduce((s, o) => {
        s[o.operationId] = api.client[o.operationId];
        return s;
      }, {}),
    });
  },
  get(id) {
    return this.tools[id];
  },
};

export const createEmptyPlugin = () =>
  ({
    id: nanoid(),
    title: "",
    version: "1.0.0",
    content: "",
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
        .map((p) => FunctionToolService.add(p));
      return [
        selected.reduce((s, i) => s.concat(i.tools), []),
        selected.reduce((s, i) => Object.assign(s, i.funcs), {}),
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
