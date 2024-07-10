import styles from "./login.module.scss";
import { IconButton } from "./button";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Path, Login, BASE_URL } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { getClientConfig } from "../config/client";
import { showToast } from "./ui-lib";

export function AuthPage() {
  const navigate = useNavigate();
  const accessStore = useAccessStore();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const goHome = () => navigate(Path.Home);
  const goChat = () => navigate(Path.Chat);
  const resetAccessCode = () => {
    accessStore.update((access) => {
      access.openaiApiKey = "";
      access.accessCode = "";
    });
  };

  useEffect(() => {
    if (getClientConfig()?.isApp) {
      navigate(Path.Settings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    try {
      const url = BASE_URL + Login.Login;

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (data.status.code === 0 && data.result === true) {
        // 登录成功逻辑
        accessStore.update((access) => {
          access.accessCode = data.accessCode; // 如果需要从响应中获取 accessCode 的话
        });
        goChat(); // 导航到聊天页面或其他逻辑
      } else {
        // 登录失败
        showToast(Locale.Login.LoginFail);
      }
    } catch (error) {
      console.error("API 请求失败", error);
      showToast(Locale.Login.SystemFail);
    }
  };

  const handleRegister = async () => {
    try {
      const url = BASE_URL + Login.Register;

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (data.status.code === 0 && data.result === true) {
        // 注册成功逻辑
        showToast(Locale.Login.ResisterSuc);
        setIsLogin(true); // 切换到登录状态
      } else {
        // 注册失败
        showToast(Locale.Login.ResisterFail);
      }
    } catch (error) {
      console.error("API 请求失败", error);
      showToast(Locale.Login.SystemFail);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      if (password !== confirmPassword) {
        showToast(Locale.Login.PasswordFail);
        return;
      }
      handleRegister();
    }
  };

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>
        {isLogin ? Locale.Login.LoginTitle : Locale.Login.RegisterTitle}
      </div>
      <div className={styles["auth-tips"]}>
        {isLogin ? Locale.Login.LoginTips : Locale.Login.RegisterTips}
      </div>

      <input
        className={styles["auth-input"]}
        type="text"
        placeholder={Locale.Login.Username}
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
      />
      <input
        className={styles["auth-input"]}
        type="password"
        placeholder={Locale.Login.Password}
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
      />
      {!isLogin && (
        <input
          className={styles["auth-input"]}
          type="password"
          placeholder={Locale.Login.ConfirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
        />
      )}

      <div className={styles["auth-actions"]}>
        <IconButton
          text={isLogin ? Locale.Login.Login : Locale.Login.Register}
          type="primary"
          onClick={handleSubmit}
        />
        <IconButton
          text={Locale.Login.Switch}
          onClick={() => setIsLogin(!isLogin)}
        />
        <IconButton
          text={Locale.Login.Later}
          onClick={() => {
            resetAccessCode();
            goHome();
          }}
        />
      </div>
    </div>
  );
}
