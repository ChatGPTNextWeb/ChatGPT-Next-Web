import { LLMModel } from "@/app/client";
import { Updater } from "@/app/typing";

export type ModelConfigProps<T> = {
  models: LLMModel[];
  config: T;
  updateConfig: Updater<T>;
};

export type ProviderConfigProps<T> = {
  readonly?: boolean;
  config: T;
  updateConfig: Updater<T>;
};
