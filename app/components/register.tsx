import styles from "./register.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";

export function RegisterPage() {
    const navigate = useNavigate();
    const access = useAccessStore();

    const goLogin = () => navigate(Path.Login);

    return (
        <div className={styles["register-page"]}>
            <div className={styles["register-title"]}>{Locale.Register.Title}</div>
            <input
                className={styles["register-input"]}
                type="number"
                placeholder={Locale.Register.Phone}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />
            <input
                className={styles["register-input"]}
                type="text"
                placeholder={Locale.Register.Name}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />
            <input
                className={styles["register-input"]}
                type="text"
                placeholder={Locale.Register.Input1}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />
            <input
                className={styles["register-input"]}
                type="password"
                placeholder={Locale.Register.Input2}
                value={access.accessCode}
                onChange={(e) => {
                    access.updateCode(e.currentTarget.value);
                }}
            />

            <div className={styles["register-input"]}>
                <IconButton
                    className={styles["register-button"]}
                    text={Locale.Register.Confirm}
                    type="primary"
                    onClick={goLogin}
                />
            </div>
        </div>
    );
}
