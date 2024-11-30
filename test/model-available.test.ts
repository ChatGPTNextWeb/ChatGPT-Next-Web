import { isModelNotavailableInServer } from "../app/utils/model";

describe("isModelNotavailableInServer", () => {
    test("test model will return false, which means the model is available", () => {
        const customModels = "";
        const modelName = "gpt-4";
        const providerNames = "OpenAI";
        const result = isModelNotavailableInServer(customModels, modelName, providerNames);
        expect(result).toBe(false);
    });

    test("test model will return false, which means the model is not available", () => {
        const customModels = "-all,gpt-4o-mini";
        const modelName = "gpt-4";
        const providerNames = "OpenAI";
        const result = isModelNotavailableInServer(customModels, modelName, providerNames);
        expect(result).toBe(true);
    });
    
    test("support passing multiple providers, model unavailable on one of the providers will return true", () => {
        const customModels = "-all,gpt-4@Google";
        const modelName = "gpt-4";
        const providerNames = ["OpenAI", "Azure"];
        const result = isModelNotavailableInServer(customModels, modelName, providerNames);
        expect(result).toBe(true);
    });

    test("support passing multiple providers, model available on one of the providers will return false", () => {
        const customModels = "-all,gpt-4@Google";
        const modelName = "gpt-4";
        const providerNames = ["OpenAI", "Google"];
        const result = isModelNotavailableInServer(customModels, modelName, providerNames);
        expect(result).toBe(false);
    });

    test("test custom model without setting provider", () => {
        const customModels = "-all,mistral-large";
        const modelName = "mistral-large";
        const providerNames = modelName;
        const result = isModelNotavailableInServer(customModels, modelName, providerNames);
        expect(result).toBe(false);
    });
})