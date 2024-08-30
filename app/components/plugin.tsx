import { useDebouncedCallback } from "use-debounce";
import OpenAPIClientAxios from "openapi-client-axios";
import yaml from "js-yaml";
import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./mask.module.scss";
import pluginStyles from "./plugin.module.scss";

import DownloadIcon from "../icons/download.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";

import { Plugin, usePluginStore, FunctionToolService } from "../store/plugin";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
  showToast,
} from "./ui-lib";
import { downloadAs } from "../utils";
import Locale from "../locales";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Path } from "../constant";
import { nanoid } from "nanoid";

export function PluginPage() {
  const navigate = useNavigate();
  const pluginStore = usePluginStore();

  const allPlugins = pluginStore.getAll();
  const [searchPlugins, setSearchPlugins] = useState<Plugin[]>([]);
  const [searchText, setSearchText] = useState("");
  const plugins = searchText.length > 0 ? searchPlugins : allPlugins;

  // refactored already, now it accurate
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allPlugins.filter((m) =>
        m.title.toLowerCase().includes(text.toLowerCase()),
      );
      setSearchPlugins(result);
    } else {
      setSearchPlugins(allPlugins);
    }
  };

  const [editingPluginId, setEditingPluginId] = useState<string | undefined>();
  const editingPlugin = pluginStore.get(editingPluginId);
  const editingPluginTool = FunctionToolService.get(editingPlugin?.id);
  const closePluginModal = () => setEditingPluginId(undefined);

  const onChangePlugin = useDebouncedCallback((editingPlugin, e) => {
    const content = e.target.innerText;
    try {
      const api = new OpenAPIClientAxios({ definition: yaml.load(content) });
      api
        .init()
        .then(() => {
          if (content != editingPlugin.content) {
            pluginStore.updatePlugin(editingPlugin.id, (plugin) => {
              plugin.content = content;
              const tool = FunctionToolService.add(plugin, true);
              plugin.title = tool.api.definition.info.title;
              plugin.version = tool.api.definition.info.version;
            });
          }
        })
        .catch((e) => {
          console.error(e);
          showToast(Locale.Plugin.EditModal.Error);
        });
    } catch (e) {
      console.error(e);
      showToast(Locale.Plugin.EditModal.Error);
    }
  }, 100).bind(null, editingPlugin);

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Plugin.Page.Title}
            </div>
            <div className="window-header-submai-title">
              {Locale.Plugin.Page.SubTitle(plugins.length)}
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.Plugin.Page.Search}
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />

            <IconButton
              className={styles["mask-create"]}
              icon={<AddIcon />}
              text={Locale.Plugin.Page.Create}
              bordered
              onClick={() => {
                const createdPlugin = pluginStore.create();
                setEditingPluginId(createdPlugin.id);
              }}
            />
          </div>

          <div>
            {plugins.map((m) => (
              <div className={styles["mask-item"]} key={m.id}>
                <div className={styles["mask-header"]}>
                  <div className={styles["mask-icon"]}></div>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>
                      {m.title}@<small>{m.version}</small>
                    </div>
                    <div className={styles["mask-info"] + " one-line"}>
                      {Locale.Plugin.Item.Info(
                        FunctionToolService.add(m).length,
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles["mask-actions"]}>
                  {m.builtin ? (
                    <IconButton
                      icon={<EyeIcon />}
                      text={Locale.Plugin.Item.View}
                      onClick={() => setEditingPluginId(m.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EditIcon />}
                      text={Locale.Plugin.Item.Edit}
                      onClick={() => setEditingPluginId(m.id)}
                    />
                  )}
                  {!m.builtin && (
                    <IconButton
                      icon={<DeleteIcon />}
                      text={Locale.Plugin.Item.Delete}
                      onClick={async () => {
                        if (
                          await showConfirm(Locale.Plugin.Item.DeleteConfirm)
                        ) {
                          pluginStore.delete(m.id);
                        }
                      }}
                    />
                  )}
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
                    `${editingPlugin.title}@${editingPlugin.version}.json`,
                  )
                }
              />,
            ]}
          >
            <div className={styles["mask-page"]}>
              <div className={pluginStyles["plugin-title"]}>
                {Locale.Plugin.EditModal.Content}
              </div>
              <div
                className={`markdown-body ${pluginStyles["plugin-content"]}`}
                dir="auto"
              >
                <pre>
                  <code
                    contentEditable={true}
                    dangerouslySetInnerHTML={{ __html: editingPlugin.content }}
                    onBlur={onChangePlugin}
                  ></code>
                </pre>
              </div>
              <div className={pluginStyles["plugin-title"]}>
                {Locale.Plugin.EditModal.Method}
              </div>
              <div className={styles["mask-page-body"]} style={{ padding: 0 }}>
                {editingPluginTool?.tools.map((tool, index) => (
                  <div className={styles["mask-item"]} key={index}>
                    <div className={styles["mask-header"]}>
                      <div className={styles["mask-title"]}>
                        <div className={styles["mask-name"]}>
                          {tool?.function?.name}
                        </div>
                        <div className={styles["mask-info"] + " one-line"}>
                          {tool?.function?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}
