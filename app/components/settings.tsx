import { useState, useEffect, useMemo, HTMLProps } from "react";

import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

	@@ -8,6 +8,8 @@ import ResetIcon from "../icons/reload.svg";
import CloseIcon from "../icons/close.svg";
import ClearIcon from "../icons/clear.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import EyeOffIcon from "../icons/eye-off.svg";

import { List, ListItem, Popover, showToast } from "./ui-lib";

	@@ -47,6 +49,28 @@ function SettingItem(props: {
  );
}

function PasswordInput(props: HTMLProps<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <span style={{ display: "flex", justifyContent: "end" }}>
      <input
        {...props}
        style={{ minWidth: "150px" }}
        type={visible ? "text" : "password"}
      />
      <IconButton
        icon={visible ? <EyeIcon /> : <EyeOffIcon />}
        onClick={changeVisibility}
      />
    </span>
  );
}

export function Settings(props: { closeSettings: () => void }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [config, updateConfig, resetConfig, clearAllData, clearSessions] =
	@@ -103,6 +127,13 @@ export function Settings(props: { closeSettings: () => void }) {
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.prompts.size ?? 0;

  const showUsage = accessStore.token !== "";
  useEffect(() => {
    if (showUsage) {
      checkUsage();
    }
  }, [showUsage]);

  return (
    <>
      <div className={styles["window-header"]}>
	@@ -327,14 +358,14 @@ export function Settings(props: { closeSettings: () => void }) {
              title={Locale.Settings.AccessCode.Title}
              subTitle={Locale.Settings.AccessCode.SubTitle}
            >
              <PasswordInput
                value={accessStore.accessCode}
                type="text"
                placeholder={Locale.Settings.AccessCode.Placeholder}
                onChange={(e) => {
                  accessStore.updateCode(e.currentTarget.value);
                }}
              />
            </SettingItem>
          ) : (
            <></>
	@@ -344,25 +375,27 @@ export function Settings(props: { closeSettings: () => void }) {
            title={Locale.Settings.Token.Title}
            subTitle={Locale.Settings.Token.SubTitle}
          >
            <PasswordInput
              value={accessStore.token}
              type="text"
              placeholder={Locale.Settings.Token.Placeholder}
              onChange={(e) => {
                accessStore.updateToken(e.currentTarget.value);
              }}
            />
          </SettingItem>

          <SettingItem
            title={Locale.Settings.Usage.Title}
            subTitle={
              showUsage
                ? loadingUsage
                  ? Locale.Settings.Usage.IsChecking
                  : Locale.Settings.Usage.SubTitle(usage?.used ?? "[?]")
                : Locale.Settings.Usage.NoAccess
            }
          >
            {!showUsage || loadingUsage ? (
              <div />
            ) : (
              <IconButton
