import { STTConfig } from "../store";

import Locale from "../locales";
import { ListItem } from "./ui-lib";

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
    </>
  );
}
