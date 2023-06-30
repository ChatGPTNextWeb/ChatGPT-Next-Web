import { ErrorBoundary } from "./error";
import { IconButton } from "./button";
import Locale, { AllLangs, ALL_LANG_OPTIONS, Lang } from "../locales";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import EyeIcon from "../icons/eye.svg";
import { useEffect, useState } from "react";
import { DEFAULT_MASK_AVATAR, Mask, useMaskStore } from "../store/mask";
import { ChatMessage, ModelConfig, useAppConfig, useChatStore } from "../store";
import styles from "./mask.module.scss";
import { Input, List, ListItem, Modal, Popover, Select } from "./ui-lib";
import LightningIcon from "../icons/lightning.svg";
import App from "../page";
import selectGroup from "./selectGroup";

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

  const [editingMaskId, setEditingMaskId] = useState<number | undefined>();
  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <p> aaaaaa</p>

        <IconButton
          text={Locale.Auth.Confirm}
          type="primary"
          onClick={goHome}
        />
        <IconButton text={Locale.Auth.Later} onClick={goHome} />

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
            <input
              type="text"
              className={styles["search-bar"]}
              placeholder={Locale.Mask.Page.Search}
              autoFocus
              onInput={(e) => onSearch(e.currentTarget.value)}
            />
            <Select
              className={styles["mask-filter-lang"]}
              value={filterLang ?? Locale.Settings.Lang.All}
              onChange={(e) => {
                const value = e.currentTarget.value;
                if (value === Locale.Settings.Lang.All) {
                  setFilterLang(undefined);
                } else {
                  setFilterLang(value as Lang);
                }
              }}
            >
              <option key="all" value={Locale.Settings.Lang.All}>
                {Locale.Settings.Lang.All}
              </option>
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>
            <div className={styles["actions"]}>
              <IconButton
                text={Locale.NewChat.More}
                onClick={() => navigate(Path.Masks)}
                icon={<EyeIcon />}
                bordered
                shadow
              />

              <IconButton
                text={Locale.NewChat.Skip}
                onClick={() => startChat()}
                icon={<LightningIcon />}
                type="primary"
                shadow
                className={styles["skip"]}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
