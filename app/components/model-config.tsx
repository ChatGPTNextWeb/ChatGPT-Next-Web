import {
  ModalConfigValidator,
  ModelConfig,
  dall2Size,
  dall3Size,
  dall3Style,
  dall2modes,
} from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Select } from "./ui-lib";
import { useAllModels } from "../utils/hooks";
import { isDalleModel, isDalle2Model, isDalle3Model } from "../utils";
import { DEFAULT_CONFIG } from "../store/config";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();
  const isDalleModelV = isDalleModel(props.modelConfig.model);
  const isDalle2ModelV = isDalle2Model(props.modelConfig.model);
  const isDalle3ModelV = isDalle3Model(props.modelConfig.model);
  const currentSizes = isDalle3ModelV ? dall3Size : dall2Size;
  return (
    <>
      <ListItem
        title={Locale.Settings.Model}
        subTitle={isDalleModelV ? Locale.Settings.dall2Mode.ModelTips : ""}
      >
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig((config) => {
              config.model = ModalConfigValidator.model(e.currentTarget.value);
              config.n = DEFAULT_CONFIG.modelConfig.n;
              config.size = DEFAULT_CONFIG.modelConfig.size;
            });
          }}
        >
          {allModels
            .filter((v) => v.available)
            .map((v, i) => (
              <option value={v.name} key={i}>
                {v.displayName}({v.provider?.providerName})
              </option>
            ))}
        </Select>
      </ListItem>

      {!isDalleModelV && (
        <>
          <ListItem
            title={Locale.Settings.Temperature.Title}
            subTitle={Locale.Settings.Temperature.SubTitle}
          >
            <InputRange
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

          {props.modelConfig.model.startsWith("gemini") ? null : (
            <>
              <ListItem
                title={Locale.Settings.PresencePenalty.Title}
                subTitle={Locale.Settings.PresencePenalty.SubTitle}
              >
                <InputRange
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
              title={props.modelConfig.historyMessageCount.toString()}
              value={props.modelConfig.historyMessageCount}
              min="0"
              max="64"
              step="1"
              onChange={(e) =>
                props.updateConfig(
                  (config) =>
                    (config.historyMessageCount = e.target.valueAsNumber),
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
              type="checkbox"
              checked={props.modelConfig.sendMemory}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.sendMemory = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </>
      )}

      {isDalleModelV && (
        <>
          {isDalle2ModelV && (
            <>
              <ListItem
                title={Locale.Settings.dall2Mode.Title}
                subTitle={Locale.Settings.dall2Mode.SubTitle}
              >
                <Select
                  value={props.modelConfig.dall2Mode}
                  onChange={(e) => {
                    props.updateConfig((config) => {
                      config.dall2Mode = e.currentTarget
                        .value as (typeof dall2modes)[number];
                    });
                  }}
                >
                  {dall2modes.map((v) => {
                    return (
                      <option value={v} key={v}>
                        {v}
                      </option>
                    );
                  })}
                </Select>
              </ListItem>
            </>
          )}
          <ListItem
            title={Locale.Settings.n.Title}
            subTitle={Locale.Settings.n.SubTitle}
          >
            <InputRange
              value={props.modelConfig.n}
              min="1"
              max={isDalle2ModelV ? "10" : "1"} // lets limit it to 1-10
              step="1"
              onChange={(e) => {
                props.updateConfig(
                  (config) => (config.n = e.currentTarget.valueAsNumber),
                );
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.size.Title}
            subTitle={Locale.Settings.size.SubTitle}
          >
            <Select
              value={props.modelConfig.size}
              onChange={(e) => {
                props.updateConfig((config) => {
                  config.size = e.currentTarget.value;
                });
              }}
            >
              {currentSizes.map((v) => {
                return (
                  <option value={v} key={v}>
                    {v}
                  </option>
                );
              })}
            </Select>
          </ListItem>
          {isDalle3ModelV && (
            <>
              <ListItem
                title={Locale.Settings.quality.Title}
                subTitle={Locale.Settings.quality.SubTitle}
              >
                <input
                  type="checkbox"
                  checked={props.modelConfig.quality === "hd"}
                  onChange={(e) =>
                    props.updateConfig(
                      (config) =>
                        (config.quality = e.currentTarget.checked
                          ? "hd"
                          : "standard"),
                    )
                  }
                ></input>
              </ListItem>
              <ListItem
                title={Locale.Settings.style.Title}
                subTitle={Locale.Settings.style.SubTitle}
              >
                <Select
                  value={props.modelConfig.style}
                  onChange={(e) => {
                    props.updateConfig((config) => {
                      config.style = e.currentTarget.value;
                    });
                  }}
                >
                  {dall3Style.map((v) => {
                    return (
                      <option value={v} key={v}>
                        {v}
                      </option>
                    );
                  })}
                </Select>
              </ListItem>
            </>
          )}
        </>
      )}
    </>
  );
}
