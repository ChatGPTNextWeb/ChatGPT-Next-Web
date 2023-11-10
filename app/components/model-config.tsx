import { ModalConfigValidator, ModelConfig } from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Select } from "./ui-lib";
import { useAllModels } from "../utils/hooks";

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const allModels = useAllModels();

  const sizeOptions = ["256x256", "512x512", "1024x1024", "1792x1024", "1024x1792"];
  const styleOptions = ["Vivid", "Natural"];

  const isDalleModel = props.modelConfig.model.startsWith("dall-e");

  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.modelConfig.model}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
              (config.model = ModalConfigValidator.model(
                e.currentTarget.value,
              )),
            );
          }}
        >
          {allModels
            .filter((v) => v.available)
            .map((v, i) => (
              <option value={v.name} key={i}>
                {v.displayName}
              </option>
            ))}
        </Select>
      </ListItem>
      {isDalleModel && (
        <>
          <ListItem
            title={Locale.Settings.NumberOfImages.Title}
            subTitle={Locale.Settings.NumberOfImages.SubTitle}
          >
            <InputRange
              value={props.modelConfig.n?.toFixed(1)}
              min="1"
              max="10"
              step="1"
              onChange={(e) => {
                props.updateConfig((config) => {
                  config.n = ModalConfigValidator.n(e.currentTarget.valueAsNumber);
                });
              }}
            ></InputRange>
          </ListItem>
          <ListItem
            title={Locale.Settings.QualityOfImages.Title}
            subTitle={Locale.Settings.QualityOfImages.SubTitle}
          >
            <Select
              value={props.modelConfig.quality}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.quality = ModalConfigValidator.quality(e.currentTarget.value))
                )
              }
            >
              <option value="hd">HD</option>
            </Select>
          </ListItem>
          <ListItem
            title={Locale.Settings.SizeOfImages.Title}
            subTitle={Locale.Settings.SizeOfImages.SubTitle}
          >
            <Select
              value={props.modelConfig.size}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.size = ModalConfigValidator.size(e.currentTarget.value))
                )
              }
            >
              {sizeOptions.map((size) => (
                <option value={size} key={size}>
                  {size}
                </option>
              ))}
            </Select>
          </ListItem>
          <ListItem
            title={Locale.Settings.StyleOfImages.Title}
            subTitle={Locale.Settings.StyleOfImages.SubTitle}
          >
            <Select
              value={props.modelConfig.style}
              onChange={(e) =>
                props.updateConfig(
                  (config) => (config.style = ModalConfigValidator.style(e.currentTarget.value))
                )
              }
            >
              {styleOptions.map((style) => (
                <option value={style} key={style}>
                  {style}
                </option>
              ))}
            </Select>
          </ListItem>
        </>
      )}

      {!isDalleModel && (
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
              value={props.modelConfig.template}
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
    </>
  );
}
