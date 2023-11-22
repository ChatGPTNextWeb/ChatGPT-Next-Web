import { useNavigate } from "react-router-dom";

import styles from "./rightPane.module.scss";
import MaxIcon from "../../icons/max.svg";
import MinIcon from "../../icons/min.svg";
import ReturnIcon from "../../icons/return.svg";
import { IconButton } from "../../components/button";
import { useAppConfig } from "../../store";
import { useMobileScreen } from "@/app/utils";
import Locale from "../../locales";
import { Path } from "@/app/constant";

interface RightPaneProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

function RightPane({ title, subtitle, children }: RightPaneProps) {
  const config = useAppConfig();
  const isMobileScreen = useMobileScreen();
  const navigate = useNavigate();

  return (
    <div
      style={{ overflow: "auto" }}
      className={styles["window-content"] + " " + styles["right-pane"]}
    >
      <div className={styles["window-header"]} data-tauri-drag-region>
        {isMobileScreen && (
          <>
            <div className="window-actions">
              <div className={"window-action-button"}>
                <IconButton
                  icon={<ReturnIcon />}
                  bordered
                  title={Locale.Chat.Actions.ChatList}
                  onClick={() => navigate(Path.Home)}
                />
              </div>
            </div>
          </>
        )}
        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div className={`window-header-main-title`}>{title}</div>
        </div>
        <div className={styles["window-actions"]}>
          <div className={styles["window-action-button"]}>
            <IconButton
              icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
              bordered
              onClick={() => {
                config.update(
                  (config) => (config.tightBorder = !config.tightBorder),
                );
              }}
            />
          </div>
        </div>
      </div>

      {isMobileScreen && (
        <span style={{ textAlign: "center" }}>
          (psst, SalgsGPT er ikke tilpasset bruk på mobil enda. Sjekk ut siden
          på PC istedenfor)
        </span>
      )}
      <div className={styles["chat-body"]}>{children}</div>
    </div>
  );
}

export default RightPane;
