import styles from "@/app/components/home.module.scss";

import { IconButton } from "@/app/components/button";
import GithubIcon from "@/app/icons/github.svg";
import SDIcon from "@/app/icons/sd.svg";
import ReturnIcon from "@/app/icons/return.svg";
import Locale from "@/app/locales";

import { Path, REPO_URL } from "@/app/constant";

import { useNavigate } from "react-router-dom";
import dynamic from "next/dynamic";
import {
  SideBarContainer,
  SideBarBody,
  useDragSideBar,
  useHotKey,
} from "@/app/components/sidebar";

const SdPanel = dynamic(
  async () => (await import("@/app/components/sd/sd-panel")).SdPanel,
  {
    loading: () => null,
  },
);

export function SideBar(props: { className?: string }) {
  useHotKey();
  const { onDragStart, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();

  return (
    <SideBarContainer
      onDragStart={onDragStart}
      shouldNarrow={shouldNarrow}
      {...props}
    >
      <div className={styles["sidebar-header"]} data-tauri-drag-region>
        <div className={styles["sidebar-title"]} data-tauri-drag-region>
          <IconButton
            icon={<ReturnIcon />}
            bordered
            title={Locale.Chat.Actions.ChatList}
            onClick={() => navigate(Path.Chat)}
          />
        </div>
        <div className={styles["sidebar-logo"] + " no-dark"}>
          <SDIcon width={38} height={38} />
        </div>
      </div>
      <SideBarBody>
        <SdPanel />
      </SideBarBody>
      <div className={styles["sidebar-tail"]}>
        <div className={styles["sidebar-actions"]}>
          <div className={styles["sidebar-action"]}>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <IconButton icon={<GithubIcon />} shadow />
            </a>
          </div>
        </div>
      </div>
    </SideBarContainer>
  );
}
