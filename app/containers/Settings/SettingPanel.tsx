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
  const { setShowPanel, id } = props;

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

  const cardClassName = "mb-6 md:mb-8 last:mb-0";

  const itemMap = {
    [Locale.Settings.GeneralSettings]: (
      <>
        <Card className={cardClassName} title={Locale.Settings.Basic.Title}>
          <AppSetting />
        </Card>

        <Card className={cardClassName} title={Locale.Settings.Mask.Title}>
          <MaskSetting />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Prompt.Title}>
          <PromptSetting />
        </Card>
        <Card className={cardClassName} title={Locale.Settings.Provider.Title}>
          <ProviderSetting />
        </Card>

        <Card className={cardClassName} title={Locale.Settings.Danger.Title}>
          <DangerItems />
        </Card>
      </>
    ),
    [Locale.Settings.ModelSettings]: (
      <Card className={cardClassName} title={Locale.Settings.Models.Title}>
        <List
          widgetStyle={{
            // selectClassName: "min-w-select-mobile-lg",
            selectClassName: "min-w-select-mobile md:min-w-select",
            inputClassName: "md:min-w-select",
            rangeClassName: "md:min-w-select",
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
    ),
    [Locale.Settings.DataSettings]: (
      <Card className={cardClassName} title={Locale.Settings.Sync.Title}>
        <SyncItems />
      </Card>
    ),
  };

  return (
    <div
      className={`
        flex flex-col overflow-hidden bg-settings-panel 
        h-setting-panel-mobile
        md:h-[100%] md:mr-2.5 md:rounded-md
      `}
    >
      <SettingHeader
        isMobileScreen={isMobileScreen}
        goback={() => setShowPanel?.(false)}
      />
      <div
        className={`
          max-md:w-[100%]
          px-4 py-5
          md:px-6 md:py-8
          flex items-start justify-center
          overflow-y-auto
        `}
      >
        <div
          className={`
            w-full
            max-w-screen-md
            !overflow-x-hidden 
            overflow-y-auto
          `}
        >
          {itemMap[id] || null}
        </div>
      </div>
    </div>
  );
}
