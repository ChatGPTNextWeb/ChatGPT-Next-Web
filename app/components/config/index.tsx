import {
  ChatConfig,
  LLMProvider,
  LLMProviders,
  ModelConfig,
  ProviderConfig,
} from "@/app/store";
import { Updater } from "@/app/typing";
import { OpenAIModelConfig } from "./openai/model";
import { OpenAIProviderConfig } from "./openai/provider";
import { ListItem, Select } from "../ui-lib";
import Locale from "@/app/locales";
import { InputRange } from "../input-range";

export function ModelConfigList(props: {
  provider: LLMProvider;
  config: ModelConfig;
  updateConfig: Updater<ModelConfig>;
}) {
  if (props.provider === "openai") {
    return (
      <OpenAIModelConfig
        config={props.config.openai}
        updateConfig={(update) => {
          props.updateConfig((config) => update(config.openai));
        }}
        models={[
          {
            name: "gpt-3.5-turbo",
            available: true,
          },
          {
            name: "gpt-4",
            available: true,
          },
        ]}
      />
    );
  }

  return null;
}

export function ProviderConfigList(props: {
  provider: LLMProvider;
  config: ProviderConfig;
  updateConfig: Updater<ProviderConfig>;
}) {
  if (props.provider === "openai") {
    return (
      <OpenAIProviderConfig
        config={props.config.openai}
        updateConfig={(update) => {
          props.updateConfig((config) => update(config.openai));
        }}
      />
    );
  }

  return null;
}

export function ProviderSelectItem(props: {
  value: LLMProvider;
  update: (value: LLMProvider) => void;
}) {
  return (
    <ListItem title="服务提供商" subTitle="切换不同的模型提供商">
      <Select
        value={props.value}
        onChange={(e) => {
          props.update(e.target.value as LLMProvider);
        }}
      >
        {LLMProviders.map(([k, v]) => (
          <option value={v} key={k}>
            {k}
          </option>
        ))}
      </Select>
    </ListItem>
  );
}

export function ChatConfigList(props: {
  config: ChatConfig;
  updateConfig: (updater: (config: ChatConfig) => void) => void;
}) {
  return (
    <>
      <ListItem
        title={Locale.Settings.InjectSystemPrompts.Title}
        subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.config.enableInjectSystemPrompts}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.enableInjectSystemPrompts = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>

      <ListItem
        title={Locale.Settings.InputTemplate.Title}
        subTitle={Locale.Settings.InputTemplate.SubTitle}
      >
        <input
          type="text"
          value={props.config.template}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.template = e.currentTarget.value),
            )
          }
        ></input>
      </ListItem>

      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <InputRange
          title={props.config.historyMessageCount.toString()}
          value={props.config.historyMessageCount}
          min="0"
          max="64"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e.target.valueAsNumber),
            )
          }
        ></InputRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
      >
        <input
          type="number"
          min={500}
          max={4000}
          value={props.config.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.compressMessageLengthThreshold =
                  e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <input
          type="checkbox"
          checked={props.config.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
    </>
  );
}
