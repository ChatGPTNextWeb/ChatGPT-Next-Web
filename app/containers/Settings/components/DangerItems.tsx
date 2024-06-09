import { IconButton } from "@/app/components/button";
import { showConfirm } from "@/app/components/ui-lib";
import { useChatStore } from "@/app/store/chat";
import { useAppConfig } from "@/app/store/config";
import Locale from "@/app/locales";
import { useAccessStore } from "@/app/store/access";
import { useEffect, useMemo, useState } from "react";
import { getClientConfig } from "@/app/config/client";
import { OPENAI_BASE_URL, ServiceProvider } from "@/app/constant";
import { useUpdateStore } from "@/app/store/update";

import ResetIcon from "@/app/icons/reload.svg";
import List, { ListItem } from "@/app/components/List";
import Input from "@/app/components/Input";
import Btn from "@/app/components/Btn";

export default function DangerItems() {
  const chatStore = useChatStore();
  const appConfig = useAppConfig();
  const accessStore = useAccessStore();
  const updateStore = useUpdateStore();
  const { isMobileScreen } = appConfig;

  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const clientConfig = useMemo(() => getClientConfig(), []);

  const showAccessCode = enabledAccessControl && !clientConfig?.isApp;

  const shouldHideBalanceQuery = useMemo(() => {
    const isOpenAiUrl = accessStore.openaiUrl.includes(OPENAI_BASE_URL);
    return (
      accessStore.hideBalanceQuery ||
      isOpenAiUrl ||
      accessStore.provider === ServiceProvider.Azure
    );
  }, [
    accessStore.hideBalanceQuery,
    accessStore.openaiUrl,
    accessStore.provider,
  ]);

  const [loadingUsage, setLoadingUsage] = useState(false);
  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };

  function checkUsage(force = false) {
    if (shouldHideBalanceQuery) {
      return;
    }

    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const showUsage = accessStore.isAuthorized();

  useEffect(() => {
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List
      widgetStyle={{
        selectClassName: "min-w-select-mobile md:min-w-select",
        inputClassName: "md:min-w-select",
        rangeClassName: "md:min-w-select",
        rangeNextLine: isMobileScreen,
        inputNextLine: isMobileScreen,
      }}
    >
      {showAccessCode && (
        <ListItem
          title={Locale.Settings.Access.AccessCode.Title}
          subTitle={Locale.Settings.Access.AccessCode.SubTitle}
        >
          <Input
            value={accessStore.accessCode}
            type="password"
            placeholder={Locale.Settings.Access.AccessCode.Placeholder}
            onChange={(e) => {
              accessStore.update((access) => (access.accessCode = e));
            }}
          />
        </ListItem>
      )}

      {!shouldHideBalanceQuery && !clientConfig?.isApp ? (
        <ListItem
          title={Locale.Settings.Usage.Title}
          subTitle={
            showUsage
              ? loadingUsage
                ? Locale.Settings.Usage.IsChecking
                : Locale.Settings.Usage.SubTitle(
                    usage?.used ?? "[?]",
                    usage?.subscription ?? "[?]",
                  )
              : Locale.Settings.Usage.NoAccess
          }
        >
          {!showUsage || loadingUsage ? (
            <div />
          ) : (
            <IconButton
              icon={<ResetIcon />}
              text={Locale.Settings.Usage.Check}
              onClick={() => checkUsage(true)}
            />
          )}
        </ListItem>
      ) : null}

      <ListItem
        title={Locale.Settings.Danger.Reset.Title}
        subTitle={Locale.Settings.Danger.Reset.SubTitle}
      >
        <Btn
          text={Locale.Settings.Danger.Reset.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
              appConfig.reset();
            }
          }}
          type="danger"
        />
      </ListItem>
      <ListItem
        title={Locale.Settings.Danger.Clear.Title}
        subTitle={Locale.Settings.Danger.Clear.SubTitle}
      >
        <Btn
          text={Locale.Settings.Danger.Clear.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
              chatStore.clearAllData();
            }
          }}
          type="danger"
        />
      </ListItem>
    </List>
  );
}
