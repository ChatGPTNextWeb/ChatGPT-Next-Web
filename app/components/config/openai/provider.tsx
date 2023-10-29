import { ProviderConfig } from "@/app/store";
import { ProviderConfigProps } from "../types";
import { ListItem, PasswordInput } from "../../ui-lib";
import Locale from "@/app/locales";
import { REMOTE_API_HOST } from "@/app/constant";

export function OpenAIProviderConfig(
  props: ProviderConfigProps<ProviderConfig["openai"]>,
) {
  return (
    <>
      <ListItem
        title={Locale.Settings.Endpoint.Title}
        subTitle={Locale.Settings.Endpoint.SubTitle}
      >
        <input
          type="text"
          value={props.config.endpoint}
          placeholder={REMOTE_API_HOST}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.endpoint = e.currentTarget.value),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.Token.Title}
        subTitle={Locale.Settings.Token.SubTitle}
      >
        <PasswordInput
          value={props.config.apiKey}
          type="text"
          placeholder={Locale.Settings.Token.Placeholder}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.apiKey = e.currentTarget.value),
            );
          }}
        />
      </ListItem>
      <ListItem
        title={Locale.Settings.CustomModel.Title}
        subTitle={Locale.Settings.CustomModel.SubTitle}
      >
        <input
          type="text"
          value={props.config.customModels}
          placeholder="model1,model2,model3"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.customModels = e.currentTarget.value),
            )
          }
        ></input>
      </ListItem>

      <ListItem title="自动拉取可用模型" subTitle="尝试拉取所有可用模型">
        <input
          type="checkbox"
          checked={props.config.autoFetchModels}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.autoFetchModels = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
    </>
  );
}
