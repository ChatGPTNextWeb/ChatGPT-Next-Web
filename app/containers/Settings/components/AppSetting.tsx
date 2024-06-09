import LoadingIcon from "@/app/icons/three-dots.svg";
import ResetIcon from "@/app/icons/reload.svg";

import styles from "../index.module.scss";

import { useEffect, useState } from "react";
import { Avatar, AvatarPicker } from "@/app/components/emoji";
import { Popover } from "@/app/components/ui-lib";
import Locale, {
  ALL_LANG_OPTIONS,
  AllLangs,
  changeLang,
  getLang,
} from "@/app/locales";
import Link from "next/link";
import { IconButton } from "@/app/components/button";
import { useUpdateStore } from "@/app/store/update";
import {
  SubmitKey,
  Theme,
  ThemeConfig,
  useAppConfig,
} from "@/app/store/config";
import { getClientConfig } from "@/app/config/client";
import { RELEASE_URL, UPDATE_URL } from "@/app/constant";
import List, { ListItem } from "@/app/components/List";
import Select from "@/app/components/Select";
import SlideRange from "@/app/components/SlideRange";
import Switch from "@/app/components/Switch";

export interface AppSettingProps {}

export default function AppSetting(props: AppSettingProps) {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const updateStore = useUpdateStore();
  const config = useAppConfig();
  const { update: updateConfig, isMobileScreen } = config;

  const currentVersion = updateStore.formatVersion(updateStore.version);
  const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;
  const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log("[Update] local version ", updateStore.version);
    console.log("[Update] remote version ", updateStore.remoteVersion);
  }

  useEffect(() => {
    // checks per minutes
    checkUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <List
      widgetStyle={{
        selectClassName: "min-w-select-mobile md:min-w-select",
        inputClassName: "md:min-w-select",
        rangeClassName: "md:min-w-select",
        rangeNextLine: isMobileScreen,
      }}
    >
      <ListItem title={Locale.Settings.Avatar}>
        <Popover
          onClose={() => setShowEmojiPicker(false)}
          content={
            <AvatarPicker
              onEmojiClick={(avatar: string) => {
                updateConfig((config) => (config.avatar = avatar));
                setShowEmojiPicker(false);
              }}
            />
          }
          open={showEmojiPicker}
        >
          <div
            className={styles.avatar}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            <Avatar avatar={config.avatar} />
          </div>
        </Popover>
      </ListItem>

      <ListItem
        title={Locale.Settings.Update.Version(currentVersion ?? "unknown")}
        subTitle={
          checkingUpdate
            ? Locale.Settings.Update.IsChecking
            : hasNewVersion
            ? Locale.Settings.Update.FoundUpdate(remoteId ?? "ERROR")
            : Locale.Settings.Update.IsLatest
        }
      >
        {checkingUpdate ? (
          <LoadingIcon />
        ) : hasNewVersion ? (
          <Link href={updateUrl} target="_blank" className="link">
            {Locale.Settings.Update.GoToUpdate}
          </Link>
        ) : (
          <IconButton
            icon={<ResetIcon />}
            text={Locale.Settings.Update.CheckUpdate}
            onClick={() => checkUpdate(true)}
          />
        )}
      </ListItem>

      <ListItem title={Locale.Settings.SendKey}>
        <Select
          value={config.submitKey}
          options={Object.values(SubmitKey).map((v) => ({
            value: v,
            label: v,
          }))}
          onSelect={(v) => {
            updateConfig((config) => (config.submitKey = v));
          }}
        />
      </ListItem>

      <ListItem title={Locale.Settings.Theme}>
        <Select
          value={config.theme}
          options={Object.entries(ThemeConfig).map(([k, t]) => ({
            value: k as Theme,
            label: t.title,
            icon: <t.icon />,
          }))}
          onSelect={(e) => {
            updateConfig((config) => (config.theme = e));
          }}
        />
      </ListItem>

      <ListItem title={Locale.Settings.Lang.Name}>
        <Select
          value={getLang()}
          options={AllLangs.map((lang) => ({
            value: lang,
            label: ALL_LANG_OPTIONS[lang],
          }))}
          onSelect={(e) => {
            changeLang(e);
          }}
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.FontSize.Title}
        subTitle={Locale.Settings.FontSize.SubTitle}
      >
        <SlideRange
          value={config.fontSize}
          range={{
            start: 12,
            stroke: 28,
          }}
          step={1}
          onSlide={(e) => updateConfig((config) => (config.fontSize = e))}
        ></SlideRange>
      </ListItem>

      <ListItem
        title={Locale.Settings.AutoGenerateTitle.Title}
        subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
      >
        <Switch
          value={config.enableAutoGenerateTitle}
          onChange={(e) =>
            updateConfig((config) => (config.enableAutoGenerateTitle = e))
          }
        />
      </ListItem>

      <ListItem
        title={Locale.Settings.SendPreviewBubble.Title}
        subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
      >
        <Switch
          value={config.sendPreviewBubble}
          onChange={(e) =>
            updateConfig((config) => (config.sendPreviewBubble = e))
          }
        />
      </ListItem>
    </List>
  );
}
