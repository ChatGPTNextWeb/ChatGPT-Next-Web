import styles from "./records.module.scss";

import ResetIcon from "../icons/reload.svg";
import CloseIcon from "../icons/close.svg";
import { List, ListItem } from "./ui-lib";

import { IconButton } from "./button";

import Locale from "../locales";
import { Path } from "../constant";

import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function ListType(props: {
  texts: { name: string; value: boolean }[];
  onTabClick: (status: boolean) => void;
  status: boolean;
}) {
  const { onTabClick, texts, status } = props;
  return (
    <div className={styles["list-type-content"]}>
      {texts.map((text) => {
        return (
          <div
            key={text.name}
            className={
              status === text.value
                ? `${styles["list-type"]} ${styles["list-type-select"]}`
                : styles["list-type"]
            }
            onClick={() => onTabClick(text.value)}
          >
            {text.name}
          </div>
        );
      })}
    </div>
  );
}

export function Records() {
  const [isPay, setIsPay] = useState<boolean>(true);
  const navigate = useNavigate();

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">积分明细</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<ResetIcon />}
              onClick={() => {
                // if (confirm(Locale.Settings.Actions.ConfirmResetAll)) {
                //   resetConfig();
                // }
              }}
              bordered
              title={Locale.Settings.Actions.ResetAll}
            />
          </div>
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Settings)}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["list-type-box"]}>
        <ListType
          onTabClick={(state) => {
            setIsPay(state);
          }}
          status={isPay}
          texts={[
            { name: "充值记录", value: true },
            { name: "消耗记录", value: false },
          ]}
        />
      </div>

      <div className={styles["list"]}>
        <List>
          <ListItem title={"充值"} subTitle={"2023-05-06"}>
            <div>+100</div>
          </ListItem>
          <ListItem title={"充值"} subTitle={"2023-05-06"}>
            <div>+100</div>
          </ListItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
