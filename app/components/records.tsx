import styles from "./records.module.scss";

import ResetIcon from "../icons/reload.svg";
import CloseIcon from "../icons/close.svg";
import { List, ListItem } from "./ui-lib";

import { IconButton } from "./button";

import Locale from "../locales";
import { Path } from "../constant";

import { ErrorBoundary } from "./error";
import { useNavigate } from "react-router-dom";

function formatVersionDate(t: string) {
  const d = new Date(+t);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();

  return [
    year.toString(),
    month.toString().padStart(2, "0"),
    day.toString().padStart(2, "0"),
  ].join("");
}

function ListType(props: { onTabClick: (isPay: boolean) => void }) {
  return (
    <div className={styles["list-type-container"]}>
      <div className={`${styles["list-type"]} ${styles["list-type-select"]}`}>
        充值记录
      </div>
      <div className={styles["list-type"]}>消耗记录</div>
    </div>
  );
}

export function Records() {
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
      <ListType
        onTabClick={() => {
          console.log(1111);
        }}
      />
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
