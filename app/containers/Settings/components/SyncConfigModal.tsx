import { Modal } from "@/app/components/ui-lib";
import { useSyncStore } from "@/app/store/sync";
import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { ProviderType } from "@/app/utils/cloud";
import { STORAGE_KEY } from "@/app/constant";
import { useMemo, useState } from "react";

import ConnectionIcon from "@/app/icons/connection.svg";
import CloudSuccessIcon from "@/app/icons/cloud-success.svg";
import CloudFailIcon from "@/app/icons/cloud-fail.svg";
import ConfirmIcon from "@/app/icons/confirm.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";
import List, { ListItem } from "@/app/components/List";
import Switch from "@/app/components/Switch";
import Select from "@/app/components/Select";
import Input from "@/app/components/Input";
import { useAppConfig } from "@/app/store";

function CheckButton() {
  const syncStore = useSyncStore();

  const couldCheck = useMemo(() => {
    return syncStore.cloudSync();
  }, [syncStore]);

  const [checkState, setCheckState] = useState<
    "none" | "checking" | "success" | "failed"
  >("none");

  async function check() {
    setCheckState("checking");
    const valid = await syncStore.check();
    setCheckState(valid ? "success" : "failed");
  }

  if (!couldCheck) return null;

  return (
    <IconButton
      text={Locale.Settings.Sync.Config.Modal.Check}
      bordered
      onClick={check}
      icon={
        checkState === "none" ? (
          <ConnectionIcon />
        ) : checkState === "checking" ? (
          <LoadingIcon />
        ) : checkState === "success" ? (
          <CloudSuccessIcon />
        ) : checkState === "failed" ? (
          <CloudFailIcon />
        ) : (
          <ConnectionIcon />
        )
      }
    ></IconButton>
  );
}

export default function SyncConfigModal(props: { onClose?: () => void }) {
  const syncStore = useSyncStore();
  const config = useAppConfig();
  const { isMobileScreen } = config;
  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Sync.Config.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <CheckButton key="check" />,
          <IconButton
            key="confirm"
            onClick={props.onClose}
            icon={<ConfirmIcon />}
            bordered
            text={Locale.UI.Confirm}
          />,
        ]}
        className="!bg-modal-mask active-new"
      >
        <List
          widgetStyle={{
            rangeNextLine: isMobileScreen,
          }}
        >
          <ListItem
            title={Locale.Settings.Sync.Config.SyncType.Title}
            subTitle={Locale.Settings.Sync.Config.SyncType.SubTitle}
          >
            <Select
              value={syncStore.provider}
              options={Object.entries(ProviderType).map(([k, v]) => ({
                value: v,
                label: k,
              }))}
              onSelect={(v) => {
                syncStore.update((config) => (config.provider = v));
              }}
            />
          </ListItem>

          <ListItem
            title={Locale.Settings.Sync.Config.Proxy.Title}
            subTitle={Locale.Settings.Sync.Config.Proxy.SubTitle}
          >
            <Switch
              value={syncStore.useProxy}
              onChange={(e) => {
                syncStore.update((config) => (config.useProxy = e));
              }}
            />
          </ListItem>
          {syncStore.useProxy ? (
            <ListItem
              title={Locale.Settings.Sync.Config.ProxyUrl.Title}
              subTitle={Locale.Settings.Sync.Config.ProxyUrl.SubTitle}
            >
              <Input
                type="text"
                value={syncStore.proxyUrl}
                onChange={(e) => {
                  syncStore.update((config) => (config.proxyUrl = e));
                }}
              ></Input>
            </ListItem>
          ) : null}

          {syncStore.provider === ProviderType.WebDAV && (
            <>
              <ListItem title={Locale.Settings.Sync.Config.WebDav.Endpoint}>
                <Input
                  type="text"
                  value={syncStore.webdav.endpoint}
                  onChange={(e) => {
                    syncStore.update((config) => (config.webdav.endpoint = e));
                  }}
                ></Input>
              </ListItem>

              <ListItem title={Locale.Settings.Sync.Config.WebDav.UserName}>
                <Input
                  type="text"
                  value={syncStore.webdav.username}
                  onChange={(e) => {
                    syncStore.update((config) => (config.webdav.username = e));
                  }}
                ></Input>
              </ListItem>
              <ListItem title={Locale.Settings.Sync.Config.WebDav.Password}>
                <Input
                  value={syncStore.webdav.password}
                  type="password"
                  onChange={(e) => {
                    syncStore.update((config) => (config.webdav.password = e));
                  }}
                ></Input>
              </ListItem>
            </>
          )}

          {syncStore.provider === ProviderType.UpStash && (
            <>
              <ListItem title={Locale.Settings.Sync.Config.UpStash.Endpoint}>
                <Input
                  type="text"
                  value={syncStore.upstash.endpoint}
                  onChange={(e) => {
                    syncStore.update((config) => (config.upstash.endpoint = e));
                  }}
                ></Input>
              </ListItem>

              <ListItem title={Locale.Settings.Sync.Config.UpStash.UserName}>
                <Input
                  type="text"
                  value={syncStore.upstash.username}
                  placeholder={STORAGE_KEY}
                  onChange={(e) => {
                    syncStore.update((config) => (config.upstash.username = e));
                  }}
                ></Input>
              </ListItem>
              <ListItem title={Locale.Settings.Sync.Config.UpStash.Password}>
                <Input
                  value={syncStore.upstash.apiKey}
                  type="password"
                  onChange={(e) => {
                    syncStore.update((config) => (config.upstash.apiKey = e));
                  }}
                ></Input>
              </ListItem>
            </>
          )}
        </List>
      </Modal>
    </div>
  );
}
