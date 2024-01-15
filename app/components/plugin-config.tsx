import { PluginConfig } from "../store";

import Locale from "../locales";
import { ListItem } from "./ui-lib";

export function PluginConfigList(props: {
  pluginConfig: PluginConfig;
  updateConfig: (updater: (config: PluginConfig) => void) => void;
}) {
  return (
    <>
      <ListItem
        title={Locale.Settings.Plugin.Enable.Title}
        subTitle={Locale.Settings.Plugin.Enable.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.pluginConfig.enable}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.enable = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.Plugin.MaxIteration.Title}
        subTitle={Locale.Settings.Plugin.MaxIteration.SubTitle}
      >
        <input
          type="number"
          min={1}
          max={10}
          value={props.pluginConfig.maxIterations}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.maxIterations = e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.Plugin.ReturnIntermediateStep.Title}
        subTitle={Locale.Settings.Plugin.ReturnIntermediateStep.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.pluginConfig.returnIntermediateSteps}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
                (config.returnIntermediateSteps = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
    </>
  );
}
