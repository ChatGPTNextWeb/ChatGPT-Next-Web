import BotIcon from "@/app/icons/bot.svg";
import LoadingIcon from "@/app/icons/three-dots.svg";

import styles from "./index.module.scss";

export default function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}
