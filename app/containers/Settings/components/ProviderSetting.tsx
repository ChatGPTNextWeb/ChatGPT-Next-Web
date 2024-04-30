import { useMemo } from "react";
import {
  Anthropic,
  Azure,
  Google,
  OPENAI_BASE_URL,
  ServiceProvider,
  SlotID,
} from "@/app/constant";
import Locale from "@/app/locales";
import { useAccessStore } from "@/app/store/access";
import { getClientConfig } from "@/app/config/client";
import { useAppConfig } from "@/app/store/config";
import List, { ListItem } from "@/app/components/List";
import Select from "@/app/components/Select";
import Switch from "@/app/components/Switch";
import Input from "@/app/components/Input";

export default function ProviderSetting() {
  const accessStore = useAccessStore();
  const config = useAppConfig();
  const { isMobileScreen } = config;
  const clientConfig = useMemo(() => getClientConfig(), []);

  return (
    <List
      id={SlotID.CustomModel}
      widgetStyle={{
        selectClassName: "min-w-select-mobile md:min-w-select",
        inputClassName: "md:min-w-select",
        rangeClassName: "md:min-w-select",
        inputNextLine: isMobileScreen,
      }}
    >
      {!accessStore.hideUserApiKey && (
        <>
          {
            // Conditionally render the following ListItem based on clientConfig.isApp
            !clientConfig?.isApp && ( // only show if isApp is false
              <ListItem
                title={Locale.Settings.Access.CustomEndpoint.Title}
                subTitle={Locale.Settings.Access.CustomEndpoint.SubTitle}
              >
                <Switch
                  value={accessStore.useCustomConfig}
                  onChange={(e) =>
                    accessStore.update((access) => (access.useCustomConfig = e))
                  }
                />
              </ListItem>
            )
          }
          {accessStore.useCustomConfig && (
            <>
              <ListItem
                title={Locale.Settings.Access.Provider.Title}
                subTitle={Locale.Settings.Access.Provider.SubTitle}
              >
                <Select
                  value={accessStore.provider}
                  onSelect={(e) => {
                    accessStore.update((access) => (access.provider = e));
                  }}
                  options={Object.entries(ServiceProvider).map(([k, v]) => ({
                    value: v,
                    label: k,
                  }))}
                />
              </ListItem>

              {accessStore.provider === ServiceProvider.OpenAI && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.OpenAI.Endpoint.Title}
                    subTitle={Locale.Settings.Access.OpenAI.Endpoint.SubTitle}
                  >
                    <Input
                      type="text"
                      value={accessStore.openaiUrl}
                      placeholder={OPENAI_BASE_URL}
                      onChange={(e = "") =>
                        accessStore.update((access) => (access.openaiUrl = e))
                      }
                    ></Input>
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.OpenAI.ApiKey.Title}
                    subTitle={Locale.Settings.Access.OpenAI.ApiKey.SubTitle}
                  >
                    <Input
                      value={accessStore.openaiApiKey}
                      type="password"
                      placeholder={
                        Locale.Settings.Access.OpenAI.ApiKey.Placeholder
                      }
                      onChange={(e) => {
                        accessStore.update(
                          (access) => (access.openaiApiKey = e),
                        );
                      }}
                    />
                  </ListItem>
                </>
              )}
              {accessStore.provider === ServiceProvider.Azure && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.Azure.Endpoint.Title}
                    subTitle={
                      Locale.Settings.Access.Azure.Endpoint.SubTitle +
                      Azure.ExampleEndpoint
                    }
                  >
                    <Input
                      type="text"
                      value={accessStore.azureUrl}
                      placeholder={Azure.ExampleEndpoint}
                      onChange={(e) =>
                        accessStore.update((access) => (access.azureUrl = e))
                      }
                    ></Input>
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Azure.ApiKey.Title}
                    subTitle={Locale.Settings.Access.Azure.ApiKey.SubTitle}
                  >
                    <Input
                      value={accessStore.azureApiKey}
                      type="password"
                      placeholder={
                        Locale.Settings.Access.Azure.ApiKey.Placeholder
                      }
                      onChange={(e) => {
                        accessStore.update(
                          (access) => (access.azureApiKey = e),
                        );
                      }}
                    />
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Azure.ApiVerion.Title}
                    subTitle={Locale.Settings.Access.Azure.ApiVerion.SubTitle}
                  >
                    <Input
                      type="text"
                      value={accessStore.azureApiVersion}
                      placeholder="2023-08-01-preview"
                      onChange={(e) =>
                        accessStore.update(
                          (access) => (access.azureApiVersion = e),
                        )
                      }
                    ></Input>
                  </ListItem>
                </>
              )}
              {accessStore.provider === ServiceProvider.Google && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.Google.Endpoint.Title}
                    subTitle={
                      Locale.Settings.Access.Google.Endpoint.SubTitle +
                      Google.ExampleEndpoint
                    }
                  >
                    <Input
                      type="text"
                      value={accessStore.googleUrl}
                      placeholder={Google.ExampleEndpoint}
                      onChange={(e) =>
                        accessStore.update((access) => (access.googleUrl = e))
                      }
                    ></Input>
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Google.ApiKey.Title}
                    subTitle={Locale.Settings.Access.Google.ApiKey.SubTitle}
                  >
                    <Input
                      value={accessStore.googleApiKey}
                      type="password"
                      placeholder={
                        Locale.Settings.Access.Google.ApiKey.Placeholder
                      }
                      onChange={(e) => {
                        accessStore.update(
                          (access) => (access.googleApiKey = e),
                        );
                      }}
                    />
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Google.ApiVersion.Title}
                    subTitle={Locale.Settings.Access.Google.ApiVersion.SubTitle}
                  >
                    <Input
                      type="text"
                      value={accessStore.googleApiVersion}
                      placeholder="2023-08-01-preview"
                      onChange={(e) =>
                        accessStore.update(
                          (access) => (access.googleApiVersion = e),
                        )
                      }
                    ></Input>
                  </ListItem>
                </>
              )}
              {accessStore.provider === ServiceProvider.Anthropic && (
                <>
                  <ListItem
                    title={Locale.Settings.Access.Anthropic.Endpoint.Title}
                    subTitle={
                      Locale.Settings.Access.Anthropic.Endpoint.SubTitle +
                      Anthropic.ExampleEndpoint
                    }
                  >
                    <Input
                      type="text"
                      value={accessStore.anthropicUrl}
                      placeholder={Anthropic.ExampleEndpoint}
                      onChange={(e) =>
                        accessStore.update(
                          (access) => (access.anthropicUrl = e),
                        )
                      }
                    ></Input>
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Anthropic.ApiKey.Title}
                    subTitle={Locale.Settings.Access.Anthropic.ApiKey.SubTitle}
                  >
                    <Input
                      value={accessStore.anthropicApiKey}
                      type="password"
                      placeholder={
                        Locale.Settings.Access.Anthropic.ApiKey.Placeholder
                      }
                      onChange={(e) => {
                        accessStore.update(
                          (access) => (access.anthropicApiKey = e),
                        );
                      }}
                    />
                  </ListItem>
                  <ListItem
                    title={Locale.Settings.Access.Anthropic.ApiVerion.Title}
                    subTitle={
                      Locale.Settings.Access.Anthropic.ApiVerion.SubTitle
                    }
                  >
                    <Input
                      type="text"
                      value={accessStore.anthropicApiVersion}
                      placeholder={Anthropic.Vision}
                      onChange={(e) =>
                        accessStore.update(
                          (access) => (access.anthropicApiVersion = e),
                        )
                      }
                    ></Input>
                  </ListItem>
                </>
              )}
            </>
          )}
        </>
      )}

      <ListItem
        title={Locale.Settings.Access.CustomModel.Title}
        subTitle={Locale.Settings.Access.CustomModel.SubTitle}
      >
        <Input
          type="text"
          value={config.customModels}
          placeholder="model1,model2,model3"
          onChange={(e) => config.update((config) => (config.customModels = e))}
        ></Input>
      </ListItem>
    </List>
  );
}
