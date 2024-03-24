import { STTConfig, STTConfigValidator } from "../store";

import Locale from "../locales";
import { ListItem, Select } from "./ui-lib";
import { DEFAULT_STT_ENGINES } from "../constant";

export function STTConfigList(props: {
  sttConfig: STTConfig;
  updateConfig: (updater: (config: STTConfig) => void) => void;
}) {
  return (
    <>
      <ListItem
        title={Locale.Settings.STT.Enable.Title}
        subTitle={Locale.Settings.STT.Enable.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.sttConfig.enable}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enable = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Settings.STT.Engine.Title}>
        <Select
          value={props.sttConfig.engine}
          onChange={(e) => {
            props.updateConfig(
              (config) =>
                (config.engine = STTConfigValidator.engine(
                  e.currentTarget.value,
                )),
            );
          }}
        >
          {DEFAULT_STT_ENGINES.map((v, i) => (
            <option value={v} key={i}>
              {v}
            </option>
          ))}
        </Select>
      </ListItem>
    </>
  );
}
