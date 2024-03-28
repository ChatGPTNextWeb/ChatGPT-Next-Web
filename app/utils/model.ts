import { LLMModel } from "../client/api";

export function collectModelTable(
  models: readonly LLMModel[],
  customModels: string,
) {
  const modelTable: Record<
    string,
    {
      available: boolean;
      name: string;
      displayName: string;
      isDefault?: boolean;
      provider?: LLMModel["provider"]; // Marked as optional
    }
  > = {};

  // default models
  models.forEach((m) => {
    modelTable[m.name] = {
      ...m,
      displayName: m.name, // 'provider' is copied over if it exists
    };
  });

  

  // server custom models
  customModels
    .split(",")
    .filter((v) => !!v && v.length > 0)
    .forEach((m) => {
      const available = !m.startsWith("-");
      const nameConfig =
        m.startsWith("+") || m.startsWith("-") ? m.slice(1) : m;
      const [name, displayName] = nameConfig.split("=");

      if (name.startsWith("*")) { // Check if name starts with wildcard
        let defaultName: string | null = null; // Add variable to store wildcard value
        defaultName = displayName || name.slice(1); // Store wildcard value
        modelTable[defaultName] = {
          name : defaultName,
          displayName: defaultName,
          available,
          isDefault : true,
          provider: modelTable[defaultName]?.provider, // Use optional chaining
        };
      } else if (name === "all") {
        Object.values(modelTable).forEach((model) => (model.available = available));
      } else {
        modelTable[name] = {
          name,
          displayName: displayName || name,
          available,
          provider: modelTable[name]?.provider, // Use optional chaining
        };
      }
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
  const allModels = Object.values(modelTable);

  return allModels;
}
