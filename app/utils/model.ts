import { LLMModel } from "../client/api";

export function collectModelTable(
  models: readonly LLMModel[],
  customModels: string,
) {
  const modelTable: Record<string, boolean> = {};

  // default models
  models.forEach((m) => (modelTable[m.name] = m.available));

  // server custom models
  customModels
    .split(",")
    .filter((v) => !!v && v.length > 0)
    .map((m) => {
      if (m.startsWith("+")) {
        modelTable[m.slice(1)] = true;
      } else if (m.startsWith("-")) {
        modelTable[m.slice(1)] = false;
      } else modelTable[m] = true;
    });
  return modelTable;
}

/**
 * Generate full model table.
 */
export function collectModels(
  models: readonly LLMModel[],
  customModels: string,
) {
  const modelTable = collectModelTable(models, customModels);
  const allModels = Object.keys(modelTable).map((m) => ({
    name: m,
    available: modelTable[m],
  }));

  return allModels;
}
