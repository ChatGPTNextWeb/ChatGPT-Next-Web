import { ModelConfig } from "../store";
import { type Mask } from "../store/mask";

export type BuiltinMask =
  | any
  | (Omit<Mask, "id" | "modelConfig"> & {
      builtin: Boolean;
      modelConfig: Partial<ModelConfig["openai"]>;
    });
