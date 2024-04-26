import { useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModels, collectModelsWithDefaultModel } from "./model";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    return collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    ).filter((m) => !configStore.dontUseModel.includes(m.name as any));
  }, [
    accessStore.customModels,
    configStore.customModels,
    configStore.models,
    configStore.dontUseModel,
  ]);

  return models;
}
