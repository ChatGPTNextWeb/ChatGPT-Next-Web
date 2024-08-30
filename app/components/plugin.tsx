import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./mask.module.scss";

import DownloadIcon from "../icons/download.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import EyeIcon from "../icons/eye.svg";
import CopyIcon from "../icons/copy.svg";

import { Plugin, usePluginStore } from "../store/plugin";
import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  showConfirm,
} from "./ui-lib";
import Locale from "../locales";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Path } from "../constant";
import { nanoid } from "nanoid";

export function PluginPage() {
  const navigate = useNavigate();
  const pluginStore = usePluginStore();
  const plugins = pluginStore.getAll();

  const [editingPluginId, setEditingPluginId] = useState<string | undefined>();
  const editingPlugin = pluginStore.get(editingPluginId);
  const closePluginModal = () => setEditingPluginId(undefined);

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
                      {`${Locale.Plugin.Item.Info(m.content.length)} / / `}
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
                    `${editingPlugin.name}.json`,
                  )
                }
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={Locale.Plugin.EditModal.Clone}
                onClick={() => {
                  navigate(Path.Plugins);
                  pluginStore.create(editingPlugin);
                  setEditingPluginId(undefined);
                }}
              />,
            ]}
          >
            PluginConfig
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}
