import { useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModels } from "./model";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    return collectModels(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
    ).filter((m) => !configStore.dontUseModel.includes(m.name as any));
  }, [
    accessStore.customModels,
    configStore.customModels,
    configStore.models,
    configStore.dontUseModel,
  ]);

  return models;
}
