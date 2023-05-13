import {
  ALL_MODELS,
  ImageModalConfigValidator,
  ImageModelConfig,
  ModalConfigValidator,
  ModelConfig,
} from "../store";

import Locale from "../locales";
import { InputRange } from "./input-range";
import { Input, List, ListItem, Select } from "./ui-lib";
import { ImageRequestSizeEnum } from "../api/openai/typing";
import { CreateImageRequestSizeEnum } from "openai";

export function ImageModelConfigList(props: {
  imageModelConfig: ImageModelConfig;
  updateConfig: (updater: (config: ImageModelConfig) => void) => void;
}) {
  return (
    <>
      <ListItem title={Locale.Settings.ImageModel.Title}>
        <input value={Locale.Settings.ImageModel.Model} disabled={true} />
      </ListItem>
      <ListItem title={Locale.Settings.ImageModel.Command}>
        <input
          value={props.imageModelConfig.command}
          onChange={(e) => {
            props.updateConfig((config) => {
              config.command = e.currentTarget.value; // Assign the parsed value
              return config;
            });
          }}
        />
      </ListItem>
      <ListItem title={Locale.Settings.ImageModel.NoOfImage}>
        <InputRange
          value={props.imageModelConfig.noOfImage.toString()} // Keep the value as a string
          onChange={(e) => {
            const newValue = parseInt(e.currentTarget.value, 10); // Parse the value as an integer
            if (!isNaN(newValue)) {
              props.updateConfig((config) => {
                config.noOfImage = newValue; // Assign the parsed value
                return config;
              });
            }
          }}
          min={"1"} // Convert the min value to a string
          max={"10"} // Convert the max value to a string
          step={"1"} // Convert the step value to a string
        />
      </ListItem>
      <ListItem title={Locale.Settings.ImageModel.Size}>
        <Select
          value={props.imageModelConfig.size}
          onChange={(e) => {
            const newSize = ImageModalConfigValidator.size(
              e.currentTarget.value,
            );
            props.updateConfig((config) => {
              config.size = newSize;
              return config;
            });
          }}
        >
          {Object.values(CreateImageRequestSizeEnum).map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>
    </>
  );
}
