import { useEffect, useMemo } from "react";
import { useAccessStore, useAppConfig } from "@/app/store";
import Locale from "@/app/locales";

import { Path } from "@/app/constant";
import List from "@/app/components/List";
import { useNavigate } from "react-router-dom";
import { getClientConfig } from "@/app/config/client";
import Card from "@/app/components/Card";
import SettingHeader from "./SettingHeader";
import { MenuWrapperInspectProps } from "@/app/components/MenuLayout";
import SyncItems from "./SyncItems";
import DangerItems from "./DangerItems";
import AppSetting from "./AppSetting";
import MaskSetting from "./MaskSetting";
import PromptSetting from "./PromptSetting";
import ProviderSetting from "./ProviderSetting";
import ModelConfigList from "./ModelSetting";

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

  let containerClassName =
    "h-[calc(100%-1.25rem)] my-2.5 ml-1 mr-2.5 rounded-md";
  let listBodyClassName = "px-6 py-8";
  let cardClassName = "max-w-setting-list mb-8";

  if (isMobileScreen) {
    containerClassName = "h-setting-panel-mobile";
    listBodyClassName = "gap-5 w-[100%] px-4 py-5";
    cardClassName = "mb-6";
  }

  return (
    <div
      className={`flex flex-col overflow-hidden bg-chat-panel ${containerClassName}`}
    >
      <SettingHeader
        isMobileScreen={isMobileScreen}
        goback={() => setShowPanel?.(false)}
      />
      <div className={`!overflow-x-hidden ${listBodyClassName}`}>
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
