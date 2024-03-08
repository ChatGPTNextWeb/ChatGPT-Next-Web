import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./plugin.module.scss";

import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";
import LeftIcon from "../icons/left.svg";

import { Plugin, usePluginStore } from "../store/plugin";
import {
  ChatMessage,
  createMessage,
  ModelConfig,
  useAppConfig,
  useChatStore,
} from "../store";
import { ROLES } from "../client/api";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
} from "./ui-lib";
import { Avatar, AvatarPicker } from "./emoji";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { useLocation, useNavigate } from "react-router-dom";

import chatStyle from "./chat.module.scss";
import { useEffect, useState } from "react";
import {
  copyToClipboard,
  downloadAs,
  getMessageTextContent,
  readFromFile,
} from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "./model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_PLUGIN_STORE } from "../plugins";
import { nanoid } from "nanoid";
import { getISOLang, getLang } from "../locales";
import { getServerSideConfig } from "../config/server";

function ContextPromptItem(props: {
  prompt: ChatMessage;
  update: (prompt: ChatMessage) => void;
  remove: () => void;
}) {
  const [focusingInput, setFocusingInput] = useState(false);

  return (
    <div className={chatStyle["context-prompt-row"]}>
      {!focusingInput && (
        <Select
          value={props.prompt.role}
          className={chatStyle["context-role"]}
          onChange={(e) =>
            props.update({
              ...props.prompt,
              role: e.target.value as any,
            })
          }
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      )}
      <Input
        value={getMessageTextContent(props.prompt)}
        type="text"
        className={chatStyle["context-content"]}
        rows={focusingInput ? 5 : 1}
        onFocus={() => setFocusingInput(true)}
        onBlur={() => {
          setFocusingInput(false);
          // If the selection is not removed when the user loses focus, some
          // extensions like "Translate" will always display a floating bar
          window?.getSelection()?.removeAllRanges();
        }}
        onInput={(e) =>
          props.update({
            ...props.prompt,
            content: e.currentTarget.value as any,
          })
        }
      />
      {!focusingInput && (
        <IconButton
          icon={<DeleteIcon />}
          className={chatStyle["context-delete-button"]}
          onClick={() => props.remove()}
          bordered
        />
      )}
    </div>
  );
}

export function ContextPrompts(props: {
  context: ChatMessage[];
  updateContext: (updater: (context: ChatMessage[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: ChatMessage) => {
    props.updateContext((context) => context.push(prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: ChatMessage) => {
    props.updateContext((context) => (context[i] = prompt));
  };

  return (
    <>
      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        {context.map((c, i) => (
          <ContextPromptItem
            key={i}
            prompt={c}
            update={(prompt) => updateContextPrompt(i, prompt)}
            remove={() => removeContextPrompt(i)}
          />
        ))}

        <div className={chatStyle["context-prompt-row"]}>
          <IconButton
            icon={<AddIcon />}
            text={Locale.Context.Add}
            bordered
            className={chatStyle["context-prompt-button"]}
            onClick={() =>
              addContextPrompt(
                createMessage({
                  role: "user",
                  content: "",
                  date: "",
                }),
              )
            }
          />
        </div>
      </div>
    </>
  );
}

export function PluginPage() {
  const navigate = useNavigate();

  const pluginStore = usePluginStore();
  const chatStore = useChatStore();

  const currentLang = getLang();
  const supportedLangs = ["cn", "ru"];
  const allPlugins = pluginStore
    .getAll()
    .filter((m) =>
      supportedLangs.includes(currentLang)
        ? m.lang === currentLang
        : m.lang === "en",
    );

  const [searchPlugins, setSearchPlugins] = useState<Plugin[]>([]);
  const [searchText, setSearchText] = useState("");
  const plugins = searchText.length > 0 ? searchPlugins : allPlugins;

  // simple search, will refactor later
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allPlugins.filter((m) =>
        m.name.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchPlugins(result);
    } else {
      setSearchPlugins(allPlugins);
    }
  };

  const [editingPluginId, setEditingPluginId] = useState<string | undefined>();
  const editingPlugin =
    pluginStore.get(editingPluginId) ??
    BUILTIN_PLUGIN_STORE.get(editingPluginId);
  const closePluginModal = () => setEditingPluginId(undefined);

  const downloadAll = () => {
    downloadAs(JSON.stringify(plugins), FileName.Plugins);
  };

  const updatePluginEnableStatus = (id: string, enable: boolean) => {
    console.log(enable);
    if (enable) pluginStore.enable(id);
    else pluginStore.disable(id);
  };

  const importFromFile = () => {
    readFromFile().then((content) => {
      try {
        const importPlugins = JSON.parse(content);
        if (Array.isArray(importPlugins)) {
          for (const plugin of importPlugins) {
            if (plugin.name) {
              pluginStore.create(plugin);
            }
          }
          return;
        }
        if (importPlugins.name) {
          pluginStore.create(importPlugins);
        }
      } catch {}
    });
  };

  const enableNodeJSPlugin = !!process.env.NEXT_PUBLIC_ENABLE_NODEJS_PLUGIN;

  return (
    <ErrorBoundary>
      <div className={styles["plugin-page"]}>
        {/* <div className={styles["plugin-header"]}>
          <IconButton
            icon={<LeftIcon />}
            text={Locale.NewChat.Return}
            onClick={() => navigate(Path.Home)}
          ></IconButton>
        </div> */}

        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Plugin.Page.Title}
            </div>
            <div className="window-header-submai-title">
              {Locale.Plugin.Page.SubTitle(allPlugins.length)}
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                onClick={() => navigate(Path.Home)}
                bordered
              />
            </div>
          </div>
        </div>

        <div className={styles["plugin-page-body"]}>
          <div className={styles["plugin-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.Plugin.Page.Search}
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />
          </div>

          <div>
            {plugins.map((m) => (
              <div className={styles["plugin-item"]} key={m.id}>
                <div className={styles["plugin-header"]}>
                  <div className={styles["plugin-title"]}>
                    <div className={styles["plugin-name"]}>{m.name}</div>
                    {m.onlyNodeRuntime && !enableNodeJSPlugin && (
                      <div className={styles["plugin-runtime-warning"]}>
                        {Locale.Plugin.RuntimeWarning}
                      </div>
                    )}
                    {/* 描述 */}
                    {/* Fix: descriptions do not wrap */}
                    <div className={styles["plugin-info"]}>
                      {`${m.description}`}
                    </div>
                  </div>
                </div>
                <div className={styles["plugin-actions"]}>
                  <input
                    type="checkbox"
                    disabled={m.onlyNodeRuntime && !enableNodeJSPlugin}
                    checked={m.enable}
                    onChange={(e) => {
                      updatePluginEnableStatus(m.id, e.currentTarget.checked);
                    }}
                  ></input>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingPlugin && (
        <div className="modal-mask">
          <Modal
            title={Locale.Plugin.EditModal.Title(editingPlugin?.builtin)}
            onClose={closePluginModal}
            actions={[
              <IconButton
                icon={<DownloadIcon />}
                text={Locale.Plugin.EditModal.Download}
                key="export"
                bordered
                onClick={() =>
                  downloadAs(
                    JSON.stringify(editingPlugin),
                    `${editingPlugin.name}.json`,
                  )
                }
              />,
            ]}
          ></Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}
