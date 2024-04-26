import { useState } from "react";
import List, { ListItem } from "@/app/components/List";
import { ContextPrompts, MaskAvatar } from "@/app/components/mask";
import { Path } from "@/app/constant";
import { ModelConfig, useAppConfig } from "@/app/store/config";
import { Mask } from "@/app/store/mask";
import { Updater } from "@/app/typing";
import { copyToClipboard } from "@/app/utils";
import Locale from "@/app/locales";
import { Popover, showConfirm } from "@/app/components/ui-lib";
import { AvatarPicker } from "@/app/components/emoji";
import ModelSetting from "@/app/containers/Settings/components/ModelSetting";
import { IconButton } from "@/app/components/button";

import CopyIcon from "@/app/icons/copy.svg";
import Switch from "@/app/components/Switch";
import Input from "@/app/components/Input";

export default function MaskConfig(props: {
  mask: Mask;
  updateMask: Updater<Mask>;
  extraListItems?: JSX.Element;
  readonly?: boolean;
  shouldSyncFromGlobal?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    if (props.readonly) return;

    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => {
      mask.modelConfig = config;
      // if user changed current session mask, it will disable auto sync
      mask.syncGlobalConfig = false;
    });
  };

  const copyMaskLink = () => {
    const maskLink = `${location.protocol}//${location.host}/#${Path.NewChat}?mask=${props.mask.id}`;
    copyToClipboard(maskLink);
  };

  const globalConfig = useAppConfig();

  const { isMobileScreen } = globalConfig;

  return (
    <>
      <ContextPrompts
        context={props.mask.context}
        updateContext={(updater) => {
          const context = props.mask.context.slice();
          updater(context);
          props.updateMask((mask) => (mask.context = context));
        }}
      />

      <List
        widgetStyle={{
          rangeNextLine: isMobileScreen,
        }}
      >
        <ListItem title={Locale.Mask.Config.Avatar}>
          <Popover
            content={
              <AvatarPicker
                onEmojiClick={(emoji) => {
                  props.updateMask((mask) => (mask.avatar = emoji));
                  setShowPicker(false);
                }}
              ></AvatarPicker>
            }
            open={showPicker}
            onClose={() => setShowPicker(false)}
          >
            <div
              onClick={() => setShowPicker(true)}
              style={{ cursor: "pointer" }}
            >
              <MaskAvatar
                avatar={props.mask.avatar}
                model={props.mask.modelConfig.model}
              />
            </div>
          </Popover>
        </ListItem>
        <ListItem title={Locale.Mask.Config.Name}>
          <Input
            type="text"
            value={props.mask.name}
            onChange={(e) =>
              props.updateMask((mask) => {
                mask.name = e;
              })
            }
          ></Input>
        </ListItem>
        <ListItem
          title={Locale.Mask.Config.HideContext.Title}
          subTitle={Locale.Mask.Config.HideContext.SubTitle}
        >
          <Switch
            value={!!props.mask.hideContext}
            onChange={(e) => {
              props.updateMask((mask) => {
                mask.hideContext = e;
              });
            }}
          ></Switch>
        </ListItem>

        {!props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Mask.Config.Share.Title}
            subTitle={Locale.Mask.Config.Share.SubTitle}
          >
            <IconButton
              icon={<CopyIcon />}
              text={Locale.Mask.Config.Share.Action}
              onClick={copyMaskLink}
            />
          </ListItem>
        ) : null}

        {props.shouldSyncFromGlobal ? (
          <ListItem
            title={Locale.Mask.Config.Sync.Title}
            subTitle={Locale.Mask.Config.Sync.SubTitle}
          >
            <Switch
              value={!!props.mask.syncGlobalConfig}
              onChange={async (e) => {
                const checked = e;
                if (
                  checked &&
                  (await showConfirm(Locale.Mask.Config.Sync.Confirm))
                ) {
                  props.updateMask((mask) => {
                    mask.syncGlobalConfig = checked;
                    mask.modelConfig = { ...globalConfig.modelConfig };
                  });
                } else if (!checked) {
                  props.updateMask((mask) => {
                    mask.syncGlobalConfig = checked;
                  });
                }
              }}
            />
          </ListItem>
        ) : null}

        <ModelSetting
          modelConfig={{ ...props.mask.modelConfig }}
          updateConfig={updateConfig}
        />
        {props.extraListItems}
      </List>
    </>
  );
}
