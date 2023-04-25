import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

import styles from "./settings.module.scss";

import ResetIcon from "../icons/reload.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import EyeOffIcon from "../icons/eye-off.svg";

import { Input, List, ListItem, Modal, Popover } from "./ui-lib";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  ALL_MODELS,
  useUpdateStore,
  useAccessStore,
  ModalConfigValidator,
  useAppConfig,
} from "../store";
import { Avatar } from "./chat";

import Locale, { AllLangs, changeLang, getLang } from "../locales";
import { copyToClipboard, getEmojiUrl } from "../utils";
import Link from "next/link";
import { Path, UPDATE_URL } from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate } from "react-router-dom";

function UserPromptModal(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            onClick={() => promptStore.add({ title: "", content: "" })}
            icon={<ClearIcon />}
            bordered
            text={Locale.Settings.Prompt.Modal.Add}
          />,
        ]}
      >
        <div className={styles["user-prompt-modal"]}>
          <input
            type="text"
            className={styles["user-prompt-search"]}
            placeholder={Locale.Settings.Prompt.Modal.Search}
            value={searchInput}
            onInput={(e) => setSearchInput(e.currentTarget.value)}
          ></input>

          <div className={styles["user-prompt-list"]}>
            {prompts.map((v, _) => (
              <div className={styles["user-prompt-item"]} key={v.id ?? v.title}>
                <div className={styles["user-prompt-header"]}>
                  <input
                    type="text"
                    className={styles["user-prompt-title"]}
                    value={v.title}
                    readOnly={!v.isUser}
                    onChange={(e) => {
                      if (v.isUser) {
                        promptStore.updateUserPrompts(
                          v.id!,
                          (prompt) => (prompt.title = e.currentTarget.value),
                        );
                      }
                    }}
                  ></input>

                  <div className={styles["user-prompt-buttons"]}>
                    {v.isUser && (
                      <IconButton
                        icon={<ClearIcon />}
                        bordered
                        className={styles["user-prompt-button"]}
                        onClick={() => promptStore.remove(v.id!)}
                      />
                    )}
                    <IconButton
                      icon={<CopyIcon />}
                      bordered
                      className={styles["user-prompt-button"]}
                      onClick={() => copyToClipboard(v.content)}
                    />
                  </div>
                </div>
                <Input
                  rows={2}
                  value={v.content}
                  className={styles["user-prompt-content"]}
                  readOnly={!v.isUser}
                  onChange={(e) => {
                    if (v.isUser) {
                      promptStore.updateUserPrompts(
                        v.id!,
                        (prompt) => (prompt.content = e.currentTarget.value),
                      );
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SettingItem(props: {
  title: string;
  subTitle?: string;
  children: JSX.Element;
}) {
  return (
    <ListItem>
      <div className={styles["settings-title"]}>
        <div>{props.title}</div>
        {props.subTitle && (
          <div className={styles["settings-sub-title"]}>{props.subTitle}</div>
        )}
      </div>
      {props.children}
    </ListItem>
  );
}

function PasswordInput(props: HTMLProps<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <div className={styles["password-input-container"]}>
      <IconButton
        icon={visible ? <EyeIcon /> : <EyeOffIcon />}
        onClick={changeVisibility}
        className={styles["password-eye"]}
      />
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={styles["password-input"]}
      />
    </div>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;
  const resetConfig = config.reset;
  const [clearAllData, clearSessions] = useChatStore((state) => [
    state.clearAllData,
    state.clearSessions,
  ]);

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = updateStore.version;
  const remoteId = updateStore.remoteVersion;
  const hasNewVersion = currentVersion !== remoteId;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });
  }

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage() {
    setLoadingUsage(true);
    updateStore.updateUsage().finally(() => {
      setLoadingUsage(false);
    });
  }

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div className={styles["window-header"]}>
        <div className={styles["window-header-title"]}>
          <div className={styles["window-header-main-title"]}>
            {Locale.Settings.Title}
          </div>
          <div className={styles["window-header-sub-title"]}>
            {Locale.Settings.SubTitle}
          </div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ClearIcon />}
              onClick={() => {
                const confirmed = window.confirm(
                  `${Locale.Settings.Actions.ConfirmClearAll.Confirm}`,
                );
                if (confirmed) {
                  clearSessions();
                }
              }}
              bordered
              title={Locale.Settings.Actions.ClearAll}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<ResetIcon />}
              onClick={() => {
                const confirmed = window.confirm(
                  `${Locale.Settings.Actions.ConfirmResetAll.Confirm}`,
                );
                if (confirmed) {
                  resetConfig();
                }
              }}
              bordered
              title={Locale.Settings.Actions.ResetAll}
            />
          </div>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <SettingItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <EmojiPicker
                  lazyLoadEmojis
                  theme={EmojiTheme.AUTO}
                  getEmojiUrl={getEmojiUrl}
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
          </SettingItem>

          <SettingItem
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
              <div />
            ) : hasNewVersion ? (
              <Link href={UPDATE_URL} target="_blank" className="link">
                {Locale.Settings.Update.GoToUpdate}
              </Link>
            ) : (
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Update.CheckUpdate}
                onClick={() => checkUpdate(true)}
              />
            )}
          </SettingItem>

          <SettingItem title={Locale.Settings.SendKey}>
            <select
              value={config.submitKey}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.submitKey = e.target.value as any as SubmitKey),
                );
              }}
            >
              {Object.values(SubmitKey).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
          </SettingItem>

          <ListItem>
            <div className={styles["settings-title"]}>
              {Locale.Settings.Theme}
            </div>
            <select
              value={config.theme}
              onChange={(e) => {
                updateConfig(
                  (config) => (config.theme = e.target.value as any as Theme),
                );
              }}
            >
              {Object.values(Theme).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
          </ListItem>

          <SettingItem title={Locale.Settings.Lang.Name}>
            <select
              value={getLang()}
              onChange={(e) => {
                changeLang(e.target.value as any);
              }}
            >
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {Locale.Settings.Lang.Options[lang]}
                </option>
              ))}
            </select>
          </SettingItem>

          <SettingItem
            title={Locale.Settings.FontSize.Title}
            subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="18"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </SettingItem>

          <SettingItem title={Locale.Settings.TightBorder}>
            <input
              type="checkbox"
              checked={config.tightBorder}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.tightBorder = e.currentTarget.checked),
                )
              }
            ></input>
          </SettingItem>

          <SettingItem title={Locale.Settings.SendPreviewBubble}>
            <input
              type="checkbox"
              checked={config.sendPreviewBubble}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.sendPreviewBubble = e.currentTarget.checked),
                )
              }
            ></input>
          </SettingItem>
        </List>

        <List>
          {enabledAccessControl ? (
            <SettingItem
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
          )}

          <SettingItem
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
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Usage.Check}
                onClick={checkUsage}
              />
            )}
          </SettingItem>

          <SettingItem
            title={Locale.Settings.HistoryCount.Title}
            subTitle={Locale.Settings.HistoryCount.SubTitle}
          >
            <InputRange
              title={config.historyMessageCount.toString()}
              value={config.historyMessageCount}
              min="0"
              max="25"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.historyMessageCount = e.target.valueAsNumber),
                )
              }
            ></InputRange>
          </SettingItem>

          <SettingItem
            title={Locale.Settings.CompressThreshold.Title}
            subTitle={Locale.Settings.CompressThreshold.SubTitle}
          >
            <input
              type="number"
              min={500}
              max={4000}
              value={config.compressMessageLengthThreshold}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.compressMessageLengthThreshold =
                      e.currentTarget.valueAsNumber),
                )
              }
            ></input>
          </SettingItem>
        </List>

        <List>
          <SettingItem
            title={Locale.Settings.Prompt.Disable.Title}
            subTitle={Locale.Settings.Prompt.Disable.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.disablePromptHint}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.disablePromptHint = e.currentTarget.checked),
                )
              }
            ></input>
          </SettingItem>

          <SettingItem
            title={Locale.Settings.Prompt.List}
            subTitle={Locale.Settings.Prompt.ListCount(
              builtinCount,
              customCount,
            )}
          >
            <IconButton
              icon={<EditIcon />}
              text={Locale.Settings.Prompt.Edit}
              onClick={() => setShowPromptModal(true)}
            />
          </SettingItem>
        </List>

        <List>
          <SettingItem title={Locale.Settings.Model}>
            <select
              value={config.modelConfig.model}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.model = ModalConfigValidator.model(
                      e.currentTarget.value,
                    )),
                );
              }}
            >
              {ALL_MODELS.map((v) => (
                <option value={v.name} key={v.name} disabled={!v.available}>
                  {v.name}
                </option>
              ))}
            </select>
          </SettingItem>
          <SettingItem
            title={Locale.Settings.Temperature.Title}
            subTitle={Locale.Settings.Temperature.SubTitle}
          >
            <InputRange
              value={config.modelConfig.temperature?.toFixed(1)}
              min="0"
              max="2"
              step="0.1"
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.temperature =
                      ModalConfigValidator.temperature(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </SettingItem>
          <SettingItem
            title={Locale.Settings.MaxTokens.Title}
            subTitle={Locale.Settings.MaxTokens.SubTitle}
          >
            <input
              type="number"
              min={100}
              max={32000}
              value={config.modelConfig.max_tokens}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.modelConfig.max_tokens =
                      ModalConfigValidator.max_tokens(
                        e.currentTarget.valueAsNumber,
                      )),
                )
              }
            ></input>
          </SettingItem>
          <SettingItem
            title={Locale.Settings.PresencePenlty.Title}
            subTitle={Locale.Settings.PresencePenlty.SubTitle}
          >
            <InputRange
              value={config.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.1"
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </SettingItem>
        </List>

        {shouldShowPromptModal && (
          <UserPromptModal onClose={() => setShowPromptModal(false)} />
        )}
      </div>
    </ErrorBoundary>
  );
}
