import { ModelConfig } from "@/app/store";
import { ModelConfigProps } from "../types";
import { ListItem, Select } from "../../ui-lib";
import Locale from "@/app/locales";
import { InputRange } from "../../input-range";

export function AnthropicModelConfig(
  props: ModelConfigProps<ModelConfig["anthropic"]>,
) {
  return (
    <>
      <ListItem title={Locale.Settings.Model}>
        <Select
          value={props.config.model}
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.model = e.currentTarget.value),
            );
          }}
        >
          {props.models.map((v, i) => (
            <option value={v.name} key={i} disabled={!v.available}>
              {v.name}
            </option>
          ))}
        </Select>
      </ListItem>
      <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          value={props.config.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.temperature = e.currentTarget.valueAsNumber),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <InputRange
          value={(props.config.top_p ?? 1).toFixed(1)}
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) => (config.top_p = e.currentTarget.valueAsNumber),
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
          min={100}
          max={100000}
          value={props.config.max_tokens_to_sample}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.max_tokens_to_sample = e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
    </>
  );
}
