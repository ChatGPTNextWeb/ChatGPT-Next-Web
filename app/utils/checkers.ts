import { useAccessStore } from "../store/access";
import { useAppConfig } from "../store/config";
import { collectModels } from "./model";

export function identifyDefaultClaudeModel(modelName: string) {
  const accessStore = useAccessStore.getState();
  const configStore = useAppConfig.getState();

  const allModals = collectModels(
    configStore.models,
    [configStore.customModels, accessStore.customModels].join(","),
  );

  const modelMeta = allModals.find((m) => m.name === modelName);

  return (
    modelName.startsWith("claude") &&
    modelMeta?.provider?.providerType === "anthropic"
  );
}

export function identifyDefaultBaiduModel(modelName: string) {
  const accessStore = useAccessStore.getState();
  const configStore = useAppConfig.getState();

  const allModals = collectModels(
    configStore.models,
    [configStore.customModels, accessStore.customModels].join(","),
  );

  const modelMeta = allModals.find((m) => m.name === modelName);

  const isBaiduModel =
    modelName.startsWith("completions_pro") || modelName.startsWith("ernie");

  return isBaiduModel && modelMeta?.provider?.providerType === "baidu";
}
