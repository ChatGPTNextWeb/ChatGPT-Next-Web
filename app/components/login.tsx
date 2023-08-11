import styles from "./login.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";

export function LoginPage() {
    const navigate = useNavigate();
    const access = useAccessStore();

    const goHome = () => navigate(Path.Home);
    const goRegister = () => navigate(Path.Register);

    return (
        <div className={styles["login-page"]}>
            <div className={styles["login-title"]}>{Locale.Login.Title}</div>
            <input
                className={styles["login-input"]}
                type="text"
                placeholder={Locale.Login.Input1}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />
            <input
                className={styles["login-input"]}
                type="password"
                placeholder={Locale.Login.Input2}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />

            <div className={styles["login-input"]}>
                <IconButton
                    className={styles["login-button"]}
                    text={Locale.Login.Confirm}
                    type="primary"
                    onClick={goHome}
                />
                <IconButton className={styles["register-button"]} text={Locale.Login.register} onClick={goRegister} />
            </div>
        </div>
    );
}
