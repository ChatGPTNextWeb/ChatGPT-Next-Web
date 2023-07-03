import { ErrorBoundary } from "./error";
import { IconButton } from "./button";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import EyeIcon from "../icons/eye.svg";
import { useEffect, useState } from "react";
import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "../store/mask";
import {
  ChatMessage,
  ModelConfig,
  useAppConfig,
  useChatStore,
  useAccessStore,
} from "../store"; //存储填写的内容
import styles from "./new-chat.module.scss";

import {
  Input,
  List,
  ListItem,
  Modal,
  Popover,
  Select,
  PasswordInput,
} from "./ui-lib";
import LightningIcon from "../icons/lightning.svg";
import App from "../page";
import LeftIcon from "../icons/left.svg";
import { EmojiAvatar } from "./emoji";
export function Group() {
  const onSearch = (text: string) => {
    setSearchText(text);
    if (text.length > 0) {
      const result = allMasks.filter((m) => m.name.includes(text));
      setSearchMasks(result);
    } else {
      setSearchMasks(allMasks);
    }
  };

  const navigate = useNavigate();
  const goHome = () => navigate(Path.Home);
  const [searchMasks, setSearchMasks] = useState<Mask[]>([]);
  const [searchText, setSearchText] = useState("");

  const accessStore = useAccessStore();
  const maskStore = useMaskStore();
  const chatStore = useChatStore();
  const [filterLang, setFilterLang] = useState<Lang>();
  const allMasks = maskStore
    .getAll()
    .filter((m) => !filterLang || m.lang === filterLang);
  const masks = searchText.length > 0 ? searchMasks : allMasks;
  const startChat = (mask?: Mask) => {
    chatStore.newSession(mask);
    setTimeout(() => navigate(Path.Chat), 1);
  };
  const startGroupChat = (mask?: Mask) => {
    chatStore.newSessions(mask);
    setTimeout(() => navigate(Path.Chat, { state: { fromGroup: true } }), 1);
  };
  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();

  const [inputValue, setInputValue] = useState("");
  const [inputValuenum, setInputValuenum] = useState(0);
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
    // 在这里可以将输入的内容保存到数据库或发送给服务器等操作
  };
  const handleInputChangeNum = (event) => {
    setInputValuenum(event.target.value);
    // 在这里可以将输入的内容保存到数据库或发送给服务器等操作
  };
  const session = chatStore.currentSession();
  const renameSession = () => {
    chatStore.updateCurrentSession((session) => (session.topic = inputValue));
  };

  return (
    <div className={styles["new-chat"]}>
      <div className={styles["mask-header"]}>
        <div className="window-header" data-tauri-drag-region>
          <div className="window-header-title">
            <div className="window-header-main-title">
              {Locale.Settings.Title}
            </div>
            <div className="window-header-sub-title">
              {Locale.Settings.Group}
            </div>
          </div>
        </div>
        <div className={styles["settings"]}>
          <List>
            <ListItem title={Locale.Settings.groupmem}>
              <input
                value={inputValuenum}
                type="text"
                placeholder={Locale.Settings.groupMem.Placeholder}
                onChange={handleInputChangeNum}
              ></input>
            </ListItem>

            <ListItem title={Locale.Settings.groupName}>
              <input
                value={inputValue}
                type="text"
                placeholder={Locale.Settings.groupMem.PlaceholderName}
                onChange={handleInputChange}
              ></input>
            </ListItem>
            <ListItem title={Locale.Settings.groupUser}>
              <input
                value={accessStore.accessCode}
                type="text"
                placeholder={Locale.Settings.groupMem.PlaceholderUser}
                onChange={(e) => {
                  accessStore.updateCode(e.currentTarget.value);
                }}
              ></input>
            </ListItem>
          </List>
        </div>

        <IconButton
          icon={<LeftIcon />}
          text={Locale.NewChat.Return}
          onClick={() => navigate(Path.Home)}
        ></IconButton>
      </div>
      <div className={styles["mask-cards"]}>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f606" size={24} />
        </div>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f916" size={24} />
        </div>
        <div className={styles["mask-card"]}>
          <EmojiAvatar avatar="1f479" size={24} />
        </div>
      </div>
      <div className={styles["actions"]}>
        <IconButton
          text={Locale.NewChat.Skip}
          icon={<LightningIcon />}
          type="primary"
          shadow
          className={styles["skip"]}
          onClick={() => {
            startGroupChat();
            renameSession();
          }}
        />
      </div>
    </div>
  );
}
