import List, { ListItem } from "@/app/components/List";
import Switch from "@/app/components/Switch";
import Locale from "@/app/locales";
import { useAppConfig } from "@/app/store/config";

export interface MaskSettingProps {}

export default function MaskSetting(props: MaskSettingProps) {
  const config = useAppConfig();
  const updateConfig = config.update;

  return (
    <List>
      <ListItem
        title={Locale.Settings.Mask.Splash.Title}
        subTitle={Locale.Settings.Mask.Splash.SubTitle}
      >
        <Switch
          value={!config.dontShowMaskSplashScreen}
          onChange={(e) =>
            updateConfig((config) => (config.dontShowMaskSplashScreen = !e))
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.Mask.Builtin.Title}
        subTitle={Locale.Settings.Mask.Builtin.SubTitle}
      >
        <Switch
          value={config.hideBuiltinMasks}
          onChange={(e) =>
            updateConfig((config) => (config.hideBuiltinMasks = e))
          }
        />
      </ListItem>
    </List>
  );
}
