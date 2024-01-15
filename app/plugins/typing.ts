import { type Plugin } from "../store/plugin";

export type BuiltinPlugin = Omit<Plugin, "id"> & {
  builtin: Boolean;
};
