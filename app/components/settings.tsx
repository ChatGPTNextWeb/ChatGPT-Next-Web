import { useState, useRef, useEffect } from "react";

import EmojiPicker, { Emoji, Theme as EmojiTheme } from "emoji-picker-react";

import styles from "./settings.module.scss";

import ResetIcon from "../icons/reload.svg";

import { List, ListItem, Popover } from "./ui-lib";

import { IconButton } from "./button";
import { SubmitKey, useChatStore, Theme } from "../store";
import { Avatar } from "./home";
import dynamic from "next/dynamic";

export function Settings() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [config, updateConfig, resetConfig] = useChatStore((state) => [
    state.config,
    state.updateConfig,
    state.resetConfig,
  ]);

  return (
    <>
      <div className={styles["window-header"]}>
        <div>
          <div className={styles["window-header-title"]}>设置</div>
          <div className={styles["window-header-sub-title"]}>设置选项</div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ResetIcon />}
              onClick={resetConfig}
              bordered
              title="重置所有选项"
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem>
            <div className={styles["settings-title"]}>头像</div>
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
            <div className={styles["settings-title"]}>发送键</div>
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
            <div className={styles["settings-title"]}>主题</div>
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
            <div className={styles["settings-title"]}>紧凑边框</div>
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
        </List>
        <List>
          <ListItem>
            <div className={styles["settings-title"]}>最大上下文消息数</div>
            <input
              type="range"
              title={config.historyMessageCount.toString()}
              value={config.historyMessageCount}
              min="5"
              max="20"
              step="5"
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
              上下文中包含机器人消息
            </div>
            <input
              type="checkbox"
              checked={config.sendBotMessages}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.sendBotMessages = e.currentTarget.checked)
                )
              }
            ></input>
          </ListItem>
        </List>
      </div>
    </>
  );
}
