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
import { copyToClipboard, downloadAs, readFromFile } from "../utils";
import { Updater } from "../typing";
import { ModelConfigList } from "./model-config";
import { FileName, Path } from "../constant";
import { BUILTIN_PLUGIN_STORE } from "../plugins";
import { nanoid } from "nanoid";
import { getISOLang, getLang } from "../locales";

// export function PluginConfig(props: {
//   plugin: Plugin;
//   updateMask: Updater<Plugin>;
//   extraListItems?: JSX.Element;
//   readonly?: boolean;
//   shouldSyncFromGlobal?: boolean;
// }) {
//   const [showPicker, setShowPicker] = useState(false);

//   const updateConfig = (updater: (config: ModelConfig) => void) => {
//     if (props.readonly) return;

//     // const config = { ...props.mask.modelConfig };
//     // updater(config);
//     props.updateMask((mask) => {
//       // mask.modelConfig = config;
//       // // if user changed current session mask, it will disable auto sync
//       // mask.syncGlobalConfig = false;
//     });
//   };

//   const globalConfig = useAppConfig();

//   return (
//     <>
//       <ContextPrompts
//         context={props.mask.context}
//         updateContext={(updater) => {
//           const context = props.mask.context.slice();
//           updater(context);
//           props.updateMask((mask) => (mask.context = context));
//         }}
//       />

//       <List>
//         <ListItem title={Locale.Mask.Config.Avatar}>
//           <Popover
//             content={
//               <AvatarPicker
//                 onEmojiClick={(emoji) => {
//                   props.updateMask((mask) => (mask.avatar = emoji));
//                   setShowPicker(false);
//                 }}
//               ></AvatarPicker>
//             }
//             open={showPicker}
//             onClose={() => setShowPicker(false)}
//           >
//             <div
//               onClick={() => setShowPicker(true)}
//               style={{ cursor: "pointer" }}
//             >
//             </div>
//           </Popover>
//         </ListItem>
//         <ListItem title={Locale.Mask.Config.Name}>
//           <input
//             type="text"
//             value={props.mask.name}
//             onInput={(e) =>
//               props.updateMask((mask) => {
//                 mask.name = e.currentTarget.value;
//               })
//             }
//           ></input>
//         </ListItem>
//         <ListItem
//           title={Locale.Mask.Config.HideContext.Title}
//           subTitle={Locale.Mask.Config.HideContext.SubTitle}
//         >
//           <input
//             type="checkbox"
//             checked={props.mask.hideContext}
//             onChange={(e) => {
//               props.updateMask((mask) => {
//                 mask.hideContext = e.currentTarget.checked;
//               });
//             }}
//           ></input>
//         </ListItem>

//         {!props.shouldSyncFromGlobal ? (
//           <ListItem
//             title={Locale.Mask.Config.Share.Title}
//             subTitle={Locale.Mask.Config.Share.SubTitle}
//           >
//             <IconButton
//               icon={<CopyIcon />}
//               text={Locale.Mask.Config.Share.Action}
//               onClick={copyMaskLink}
//             />
//           </ListItem>
//         ) : null}

//         {props.shouldSyncFromGlobal ? (
//           <ListItem
//             title={Locale.Mask.Config.Sync.Title}
//             subTitle={Locale.Mask.Config.Sync.SubTitle}
//           >
//             <input
//               type="checkbox"
//               checked={props.mask.syncGlobalConfig}
//               onChange={async (e) => {
//                 const checked = e.currentTarget.checked;
//                 if (
//                   checked &&
//                   (await showConfirm(Locale.Mask.Config.Sync.Confirm))
//                 ) {
//                   props.updateMask((mask) => {
//                     mask.syncGlobalConfig = checked;
//                     mask.modelConfig = { ...globalConfig.modelConfig };
//                   });
//                 } else if (!checked) {
//                   props.updateMask((mask) => {
//                     mask.syncGlobalConfig = checked;
//                   });
//                 }
//               }}
//             ></input>
//           </ListItem>
//         ) : null}
//       </List>

//       <List>
//         <ModelConfigList
//           modelConfig={{ ...props.mask.modelConfig }}
//           updateConfig={updateConfig}
//         />
//         {props.extraListItems}
//       </List>
//     </>
//   );
// }

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
        value={props.prompt.content}
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

  const allPlugins = pluginStore
    .getAll()
    .filter(
      (m) => !getLang() || m.lang === (getLang() == "cn" ? getLang() : "en"),
    );

  const [searchPlugins, setSearchPlugins] = useState<Plugin[]>([]);
  const [searchText, setSearchText] = useState("");
  const plugins = searchText.length > 0 ? searchPlugins : allPlugins;

  // simple search, will refactor later
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allPlugins.filter((m) => m.name.includes(text));
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

  return (
    <ErrorBoundary>
      <div className={styles["plugin-page"]}>
        <div className={styles["plugin-header"]}>
          <IconButton
            icon={<LeftIcon />}
            text={Locale.NewChat.Return}
            onClick={() => navigate(Path.Home)}
          ></IconButton>
        </div>
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
            {/* <div className="window-action-button">
              <IconButton
                icon={<DownloadIcon />}
                bordered
                onClick={downloadAll}
              />
            </div>
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                bordered
                onClick={() => importFromFile()}
              />
            </div> */}
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

            {/* <IconButton
              className={styles["mask-create"]}
              icon={<AddIcon />}
              text={Locale.Mask.Page.Create}
              bordered
              onClick={() => {
                const createdMask = pluginStore.create();
                setEditingMaskId(createdMask.id);
              }}
            /> */}
          </div>

          <div>
            {plugins.map((m) => (
              <div className={styles["plugin-item"]} key={m.id}>
                <div className={styles["plugin-header"]}>
                  <div className={styles["plugin-title"]}>
                    <div className={styles["plugin-name"]}>{m.name}</div>
                    {/* 描述 */}
                    <div className={styles["plugin-info"] + " one-line"}>
                      {`${m.description}`}
                    </div>
                  </div>
                </div>
                <div className={styles["plugin-actions"]}>
                  <input
                    type="checkbox"
                    checked={m.enable}
                    onChange={(e) => {
                      updatePluginEnableStatus(m.id, e.currentTarget.checked);
                    }}
                  ></input>
                  {/* {m.builtin ? (
                    <IconButton
                      icon={<EyeIcon />}
                      text={Locale.Mask.Item.View}
                      onClick={() => setEditingMaskId(m.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      text={Locale.Mask.Item.Edit}
                      onClick={() => setEditingMaskId(m.id)}
                    />
                  )}
                  {!m.builtin && (
                    <IconButton
                      icon={<DeleteIcon />}
                      text={Locale.Mask.Item.Delete}
                      onClick={async () => {
                        if (await showConfirm(Locale.Mask.Item.DeleteConfirm)) {
                          maskStore.delete(m.id);
                        }
                      }}
                    />
                  )} */}
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
          >
            {/* <PluginConfig
              plugin={editingPlugin}
              updatePlugin={(updater) =>
                pluginStore.update(editingPluginId!, updater)
              }
              readonly={editingPlugin.builtin}
            /> */}
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}
