import { ServiceProvider } from "@/app/constant";
import { ModalConfigValidator, ModelConfig } from "../store";
import { useAccessStore } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Select } from "./ui-lib";
import { useAllModels } from "../utils/hooks";
import styles from "./model-config.module.scss";
import { getModelProvider } from "../utils/model";
import { useEffect } from "react";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();
  const accessStore = useAccessStore();

  // 确保初始化时providerName和模型匹配
  useEffect(() => {
    // 确保allModels已加载
    if (!allModels || allModels.length === 0) return;

    // 检查当前选中的模型是否确实属于当前选中的服务商
    const modelBelongsToProvider = allModels.some(
      (m) =>
        m.available &&
        m.name === props.modelConfig.model &&
        m.provider?.providerName === props.modelConfig.providerName,
    );

    // 如果不匹配，则强制更新为当前服务商的第一个可用模型
    if (!modelBelongsToProvider) {
      console.log(
        `模型不匹配修复: 当前模型 ${props.modelConfig.model} 不属于 ${props.modelConfig.providerName}`,
      );

      // 找到当前服务商的第一个可用模型
      const firstModelForProvider = allModels.find(
        (m) =>
          m.available &&
          m.provider?.providerName === props.modelConfig.providerName,
      );

      if (firstModelForProvider) {
        console.log(`模型不匹配修复: 更新为 ${firstModelForProvider.name}`);
        props.updateConfig((config) => {
          config.model = ModalConfigValidator.model(firstModelForProvider.name);
        });
      } else if (props.modelConfig.providerName === ServiceProvider.OpenAI) {
        // 如果是OpenAI但没找到模型，强制设置为一个OpenAI常见模型
        const openAIModel = "gpt-4o-mini";
        console.log(
          `模型不匹配修复: 未找到OpenAI模型，默认设置为 ${openAIModel}`,
        );
        props.updateConfig((config) => {
          config.model = ModalConfigValidator.model(openAIModel);
        });
      }
    }
  }, [props.modelConfig.providerName, props.modelConfig.model, allModels]);

  // 过滤未配置API密钥的服务提供商
  const validProviders = Object.entries(ServiceProvider).filter(([_, v]) => {
    switch (v) {
      case ServiceProvider.OpenAI:
        return true; // 始终保留OpenAI选项，即使没有配置API密钥
      case ServiceProvider.Azure:
        return accessStore.isValidAzure();
      case ServiceProvider.Google:
        return accessStore.isValidGoogle();
      case ServiceProvider.Anthropic:
        return accessStore.isValidAnthropic();
      case ServiceProvider.Baidu:
        return accessStore.isValidBaidu();
      case ServiceProvider.ByteDance:
        return accessStore.isValidByteDance();
      case ServiceProvider.Alibaba:
        return accessStore.isValidAlibaba();
      case ServiceProvider.Tencent:
        return accessStore.isValidTencent();
      case ServiceProvider.Moonshot:
        return accessStore.isValidMoonshot();
      case ServiceProvider.Iflytek:
        return accessStore.isValidIflytek();
      case ServiceProvider.DeepSeek:
        return accessStore.isValidDeepSeek();
      case ServiceProvider.XAI:
        return accessStore.isValidXAI();
      case ServiceProvider.ChatGLM:
        return accessStore.isValidChatGLM();
      case ServiceProvider.SiliconFlow:
        return accessStore.isValidSiliconFlow();
      case ServiceProvider.Stability:
        return true; // 假设不需要验证或其他处理
      default:
        return false;
    }
  });

  // 确保有可用的模型供当前服务商使用
  const filteredModels = allModels.filter(
    (v) =>
      v.available &&
      v.provider?.providerName === props.modelConfig.providerName,
  );

  // 如果没有找到当前服务商的模型，显示所有模型（防止下拉列表为空）
  const modelsToShow =
    filteredModels.length > 0
      ? filteredModels
      : allModels.filter((v) => v.available);

  const value = `${props.modelConfig.model}@${props.modelConfig?.providerName}`;
  const compressModelValue = `${props.modelConfig.compressModel}@${props.modelConfig?.compressProviderName}`;

  return (
    <>
      <ListItem title={Locale.Settings.Access.Provider.Title}>
        <Select
          aria-label={Locale.Settings.Access.Provider.Title}
          value={props.modelConfig.providerName}
          onChange={(e) => {
            const provider = e.currentTarget.value as ServiceProvider;
            props.updateConfig((config) => {
              config.providerName = provider;
              const firstModelForProvider = allModels.find(
                (m) => m.available && m.provider?.providerName === provider,
              );
              if (firstModelForProvider) {
                config.model = ModalConfigValidator.model(
                  firstModelForProvider.name,
                );
              }
            });
          }}
        >
          {validProviders.map(([k, v]) => (
            <option value={v} key={k}>
              {k}
            </option>
          ))}
        </Select>
      </ListItem>

      <ListItem title={Locale.Settings.Model}>
        <Select
          aria-label={Locale.Settings.Model}
          value={value}
          align="left"
          onChange={(e) => {
            const [model, providerName] = getModelProvider(
              e.currentTarget.value,
            );
            props.updateConfig((config) => {
              config.model = ModalConfigValidator.model(model);
              config.providerName = providerName as ServiceProvider;
            });
          }}
        >
          {modelsToShow.map((v, i) => (
            <option value={`${v.name}@${v.provider?.providerName}`} key={i}>
              {v.displayName}
              {filteredModels.length === 0
                ? ` (${v.provider?.providerName})`
                : ""}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.Temperature.Title}
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.temperature = ModalConfigValidator.temperature(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.TopP.Title}
          value={(props.modelConfig.top_p ?? 1).toFixed(1)}
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.top_p = ModalConfigValidator.top_p(
                  e.currentTarget.valueAsNumber,
                )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <input
          aria-label={Locale.Settings.MaxTokens.Title}
          type="number"
          min={1024}
          max={512000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens = ModalConfigValidator.max_tokens(
                  e.currentTarget.valueAsNumber,
                )),
            )
          }
        ></input>
      </ListItem>

      {props.modelConfig?.providerName == ServiceProvider.Google ? null : (
        <>
          <ListItem
            title={Locale.Settings.PresencePenalty.Title}
            subTitle={Locale.Settings.PresencePenalty.SubTitle}
          >
            <InputRange
              aria={Locale.Settings.PresencePenalty.Title}
              value={props.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.FrequencyPenalty.Title}
            subTitle={Locale.Settings.FrequencyPenalty.SubTitle}
          >
            <InputRange
              aria={Locale.Settings.FrequencyPenalty.Title}
              value={props.modelConfig.frequency_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                props.updateConfig(
                  (config) =>
                    (config.frequency_penalty =
                      ModalConfigValidator.frequency_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.InjectSystemPrompts.Title}
            subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
          >
            <input
              aria-label={Locale.Settings.InjectSystemPrompts.Title}
              type="checkbox"
              checked={props.modelConfig.enableInjectSystemPrompts}
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.enableInjectSystemPrompts =
                      e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.InputTemplate.Title}
            subTitle={Locale.Settings.InputTemplate.SubTitle}
          >
            <input
              aria-label={Locale.Settings.InputTemplate.Title}
              type="text"
              value={props.modelConfig.template}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.template = e.currentTarget.value),
                )
              }
            ></input>
          </ListItem>
        </>
      )}
      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <InputRange
          aria={Locale.Settings.HistoryCount.Title}
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
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
          aria-label={Locale.Settings.CompressThreshold.Title}
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
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
          aria-label={Locale.Memory.Title}
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Settings.CompressProvider.Title}>
        <Select
          aria-label={Locale.Settings.CompressProvider.Title}
          value={
            props.modelConfig.compressProviderName || ServiceProvider.OpenAI
          }
          onChange={(e) => {
            const provider = e.currentTarget.value as ServiceProvider;
            props.updateConfig((config) => {
              config.compressProviderName = provider;
              // 如果选择了新的提供商，自动选择该提供商的第一个可用模型
              if (provider) {
                const firstModelForProvider = allModels.find(
                  (m) => m.available && m.provider?.providerName === provider,
                );
                if (firstModelForProvider) {
                  config.compressModel = ModalConfigValidator.model(
                    firstModelForProvider.name,
                  );
                }
              }
            });
          }}
        >
          {validProviders.map(([k, v]) => (
            <option value={v} key={k}>
              {k}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.Settings.CompressModel.Title}
        subTitle={Locale.Settings.CompressModel.SubTitle}
      >
        <Select
          className={styles["select-compress-model"]}
          aria-label={Locale.Settings.CompressModel.Title}
          value={compressModelValue}
          onChange={(e) => {
            const [model, providerName] = getModelProvider(
              e.currentTarget.value,
            );
            props.updateConfig((config) => {
              config.compressModel = ModalConfigValidator.model(model);
              config.compressProviderName = providerName as ServiceProvider;
            });
          }}
        >
          {allModels
            .filter(
              (v) =>
                v.available &&
                (!props.modelConfig.compressProviderName ||
                  v.provider?.providerName ===
                    props.modelConfig.compressProviderName),
            )
            .map((v, i) => (
              <option value={`${v.name}@${v.provider?.providerName}`} key={i}>
                {v.displayName}
                {!props.modelConfig.compressProviderName
                  ? `(${v.provider?.providerName})`
                  : ""}
              </option>
            ))}
        </Select>
      </ListItem>
    </>
  );
}
