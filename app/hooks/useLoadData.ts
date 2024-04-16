import { useEffect } from "react";
import { useAppConfig } from "@/app/store/config";
import { ClientApi } from "@/app/client/api";
import { ModelProvider } from "@/app/constant";
import { identifyDefaultClaudeModel } from "@/app/utils/checkers";

export function useLoadData() {
  const config = useAppConfig();

  var api: ClientApi;
  if (config.modelConfig.model.startsWith("gemini")) {
    api = new ClientApi(ModelProvider.GeminiPro);
  } else if (identifyDefaultClaudeModel(config.modelConfig.model)) {
    api = new ClientApi(ModelProvider.Claude);
  } else {
    api = new ClientApi(ModelProvider.GPT);
  }
  useEffect(() => {
    (async () => {
      const models = await api.llm.models();
      config.mergeModels(models);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
