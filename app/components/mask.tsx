import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./mask.module.scss";

import DownloadIcon from "../icons/download.svg";
import EditIcon from "../icons/edit.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";
import BotIcon from "../icons/bot.svg";
import CopyIcon from "../icons/copy.svg";

import {
  DEFAULT_MASK_AVATAR,
  DEFAULT_MASK_ID,
  Mask,
  useMaskStore,
} from "../store/mask";
import {
  Message,
  ModelConfig,
  ROLES,
  useAppConfig,
  useChatStore,
} from "../store";
import { Input, List, ListItem, Modal, Popover, showToast } from "./ui-lib";
import { Avatar, AvatarPicker, EmojiAvatar } from "./emoji";
import Locale from "../locales";
import { useNavigate } from "react-router-dom";

import chatStyle from "./chat.module.scss";
import { useState } from "react";
import { copyToClipboard } from "../utils";
import { Updater } from "../api/openai/typing";
import { ModelConfigList } from "./model-config";
import { Path } from "../constant";

export function MaskAvatar(props: { mask: Mask }) {
  return props.mask.avatar !== DEFAULT_MASK_AVATAR ? (
    <Avatar avatar={props.mask.avatar} />
  ) : (
    <Avatar model={props.mask.modelConfig.model} />
  );
}

export function MaskConfig(props: {
  mask: Mask;
  updateMask: Updater<Mask>;
  extraListItems?: JSX.Element;
}) {
  const [showPicker, setShowPicker] = useState(false);

  const updateConfig = (updater: (config: ModelConfig) => void) => {
    const config = { ...props.mask.modelConfig };
    updater(config);
    props.updateMask((mask) => (mask.modelConfig = config));
  };

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

      <List>
        <ListItem title={"角色头像"}>
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
              <MaskAvatar mask={props.mask} />
            </div>
          </Popover>
        </ListItem>
        <ListItem title={"角色名称"}>
          <input
            type="text"
            value={props.mask.name}
            onInput={(e) =>
              props.updateMask((mask) => (mask.name = e.currentTarget.value))
            }
          ></input>
        </ListItem>
      </List>

      <List>
        <ModelConfigList
          modelConfig={{ ...props.mask.modelConfig }}
          updateConfig={updateConfig}
        />
        {props.extraListItems}
      </List>
    </>
  );
}

export function ContextPrompts(props: {
  context: Message[];
  updateContext: (updater: (context: Message[]) => void) => void;
}) {
  const context = props.context;

  const addContextPrompt = (prompt: Message) => {
    props.updateContext((context) => context.push(prompt));
  };

  const removeContextPrompt = (i: number) => {
    props.updateContext((context) => context.splice(i, 1));
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    props.updateContext((context) => (context[i] = prompt));
  };

  return (
    <>
      <div className={chatStyle["context-prompt"]} style={{ marginBottom: 20 }}>
        {context.map((c, i) => (
          <div className={chatStyle["context-prompt-row"]} key={i}>
            <select
              value={c.role}
              className={chatStyle["context-role"]}
              onChange={(e) =>
                updateContextPrompt(i, {
                  ...c,
                  role: e.target.value as any,
                })
              }
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Input
              value={c.content}
              type="text"
              className={chatStyle["context-content"]}
              rows={1}
              onInput={(e) =>
                updateContextPrompt(i, {
                  ...c,
                  content: e.currentTarget.value as any,
                })
              }
            />
            <IconButton
              icon={<DeleteIcon />}
              className={chatStyle["context-delete-button"]}
              onClick={() => removeContextPrompt(i)}
              bordered
            />
          </div>
        ))}

        <div className={chatStyle["context-prompt-row"]}>
          <IconButton
            icon={<AddIcon />}
            text={Locale.Context.Add}
            bordered
            className={chatStyle["context-prompt-button"]}
            onClick={() =>
              addContextPrompt({
                role: "system",
                content: "",
                date: "",
              })
            }
          />
        </div>
      </div>
    </>
  );
}

export function MaskPage() {
  const navigate = useNavigate();

  const maskStore = useMaskStore();
  const chatStore = useChatStore();
  const masks = maskStore.getAll();

  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();
  const editingMask = maskStore.get(editingMaskId);
  const closeMaskModal = () => setEditingMaskId(undefined);

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">预设角色面具</div>
            <div className="window-header-submai-title">
              共有{masks.length} 个预设角色定义
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<AddIcon />}
                bordered
                onClick={() => maskStore.create()}
              />
            </div>
            <div className="window-action-button">
              <IconButton icon={<DownloadIcon />} bordered />
            </div>
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
          <input
            type="text"
            className={styles["search-bar"]}
            placeholder="搜索"
            autoFocus
          />

          <div>
            {masks.map((m) => (
              <div className={styles["mask-item"]} key={m.id}>
                <div className={styles["mask-header"]}>
                  <div className={styles["mask-icon"]}>
                    <MaskAvatar mask={m} />
                  </div>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>{m.name}</div>
                    <div className={styles["mask-info"] + " one-line"}>
                      {`包含 ${m.context.length} 条预设对话 / ${
                        Locale.Settings.Lang.Options[m.lang]
                      } / ${m.modelConfig.model}`}
                    </div>
                  </div>
                </div>
                <div className={styles["mask-actions"]}>
                  <IconButton
                    icon={<AddIcon />}
                    text="对话"
                    onClick={() => {
                      chatStore.newSession(m);
                      navigate(Path.Chat);
                    }}
                  />
                  <IconButton
                    icon={<EditIcon />}
                    text="编辑"
                    onClick={() => setEditingMaskId(m.id)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    text="删除"
                    onClick={() => {
                      if (confirm("确认删除？")) {
                        maskStore.delete(m.id);
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingMask && (
        <div className="modal-mask">
          <Modal title="编辑预设面具" onClose={closeMaskModal}>
            <MaskConfig
              mask={editingMask!}
              updateMask={(updater) =>
                maskStore.update(editingMaskId!, updater)
              }
            />
          </Modal>
        </div>
      )}
    </ErrorBoundary>
  );
}
