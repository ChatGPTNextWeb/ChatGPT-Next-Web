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
    );
  }, [accessStore.customModels, configStore.customModels, configStore.models]);

  return models;
}
