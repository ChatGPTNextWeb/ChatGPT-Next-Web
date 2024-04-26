import { useEffect, useMemo } from "react";
import { useAccessStore, useAppConfig } from "@/app/store";
import Locale from "@/app/locales";

import { Path } from "@/app/constant";
import List from "@/app/components/List";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "@/app/config/client";
import Card from "@/app/components/Card";
import SettingHeader from "./components/SettingHeader";
import { MenuWrapperInspectProps } from "@/app/components/MenuLayout";
import SyncItems from "./components/SyncItems";
import DangerItems from "./components/DangerItems";
import AppSetting from "./components/AppSetting";
import MaskSetting from "./components/MaskSetting";
import PromptSetting from "./components/PromptSetting";
import ProviderSetting from "./components/ProviderSetting";
import ModelConfigList from "./components/ModelSetting";

export default function Settings(props: MenuWrapperInspectProps) {
  const { setShowPanel } = props;

  const navigate = useNavigate();
  const accessStore = useAccessStore();
  const config = useAppConfig();

  const { isMobileScreen } = config;

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    if (clientConfig?.isApp) {
      // Force to set custom endpoint to true if it's app
      accessStore.update((state) => {
        state.useCustomConfig = true;
      });
    }
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const cardClassName = "mb-6 md:max-w-setting-list md:mb-8";

  return (
    <div
      className={`
        flex flex-col overflow-hidden bg-settings-panel 
        h-setting-panel-mobile
        md:h-[calc(100%-1.25rem)] md:my-2.5 md:ml-1 md:mr-2.5 md:rounded-md
      `}
    >
      <SettingHeader
        isMobileScreen={isMobileScreen}
        goback={() => setShowPanel?.(false)}
      />
      <div
        className={`
        !overflow-x-hidden 
        max-md:gap-5 max-md:w-[100%] px-4 py-5
        md:px-6 md:py-8
      `}
      >
        <Card className={cardClassName} title={Locale.Settings.Basic.Title}>
          <AppSetting />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Sync.Title}>
          <SyncItems />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Mask.Title}>
          <MaskSetting />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Prompt.Title}>
          <PromptSetting />
        </Card>
        <Card className={cardClassName}>
          <ProviderSetting />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Models.Title}>
          <List
            widgetStyle={{
              selectClassName: "min-w-select-mobile-lg",
              rangeNextLine: isMobileScreen,
            }}
          >
            <ModelConfigList
              modelConfig={config.modelConfig}
              updateConfig={(updater) => {
                const modelConfig = { ...config.modelConfig };
                updater(modelConfig);
                config.update((config) => (config.modelConfig = modelConfig));
              }}
            />
          </List>
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Danger.Title}>
          <DangerItems />
        </Card>
      </div>
    </div>
  );
}
