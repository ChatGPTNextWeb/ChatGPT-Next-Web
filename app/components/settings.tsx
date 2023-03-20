import { useState, useRef, useEffect } from "react";

import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

import styles from "./settings.module.scss";

import ResetIcon from "../icons/reload.svg";
import CloseIcon from "../icons/close.svg";
import ClearIcon from "../icons/clear.svg";

import { List, ListItem, Popover } from "./ui-lib";

import { IconButton } from "./button";
import { SubmitKey, useChatStore, Theme } from "../store";
import { Avatar } from "./home";

import Locale, { changeLang, getLang } from '../locales'

export function Settings(props: { closeSettings: () => void }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [config, updateConfig, resetConfig, clearAllData] = useChatStore((state) => [
    state.config,
    state.updateConfig,
    state.resetConfig,
    state.clearAllData,
  ]);

  return (
    <>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div className={styles["window-header-main-title"]}>{Locale.Settings.Title}</div>
          <div className={styles["window-header-sub-title"]}>{Locale.Settings.SubTitle}</div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ClearIcon />}
              onClick={clearAllData}
              bordered
              title={Locale.Settings.Actions.ClearAll}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ResetIcon />}
              onClick={resetConfig}
              bordered
              title={Locale.Settings.Actions.ResetAll}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<CloseIcon />}
              onClick={props.closeSettings}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.Avatar}</div>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <EmojiPicker
                  lazyLoadEmojis
                  theme={EmojiTheme.AUTO}
                  onEmojiClick={(e) => {
                    updateConfig((config) => (config.avatar = e.unified));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar role="user" />
              </div>
            </Popover>
          </ListItem>

          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.SendKey}</div>
            <div className="">
              <select
                value={config.submitKey}
                onChange={(e) => {
                  updateConfig(
                    (config) =>
                      (config.submitKey = e.target.value as any as SubmitKey)
                  );
                }}
              >
                {Object.values(SubmitKey).map((v) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </ListItem>

          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.Theme}</div>
            <div className="">
              <select
                value={config.theme}
                onChange={(e) => {
                  updateConfig(
                    (config) => (config.theme = e.target.value as any as Theme)
                  );
                }}
              >
                {Object.values(Theme).map((v) => (
                  <option value={v} key={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </ListItem>

          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.TightBorder}</div>
            <input
              type="checkbox"
              checked={config.tightBorder}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.tightBorder = e.currentTarget.checked)
                )
              }
            ></input>
          </ListItem>

          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.Lang.Name}</div>
            <div className="">
              <select
                value={getLang()}
                onChange={(e) => {
                  changeLang(e.target.value as any)
                }}
              >
                <option value='en' key='en'>
                  {Locale.Settings.Lang.Options.en}
                </option>

                <option value='cn' key='cn'>
                  {Locale.Settings.Lang.Options.cn}
                </option>
              </select>
            </div>
          </ListItem>
        </List>
        <List>
          <ListItem>
            <div className={styles["settings-title"]}>{Locale.Settings.HistoryCount}</div>
            <input
              type="range"
              title={config.historyMessageCount.toString()}
              value={config.historyMessageCount}
              min="2"
              max="25"
              step="2"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.historyMessageCount = e.target.valueAsNumber)
                )
              }
            ></input>
          </ListItem>

          <ListItem>
            <div className={styles["settings-title"]}>
              {Locale.Settings.CompressThreshold}
            </div>
            <input
              type="number"
              min={500}
              max={4000}
              value={config.compressMessageLengthThreshold}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.compressMessageLengthThreshold = e.currentTarget.valueAsNumber)
                )
              }
            ></input>
          </ListItem>
        </List>
      </div>
    </>
  );
}
