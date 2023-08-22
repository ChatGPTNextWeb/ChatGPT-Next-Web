import styles from "./auth.module.scss";
import { IconButton } from "./button";

import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { useAccessStore } from "../store";
import Locale from "../locales";

import BotIcon from "../icons/bot.svg";
import { useEffect } from "react";
import { getClientConfig } from "../config/client";
import { showToast } from "./ui-lib";

export function AuthPage() {
  const navigate = useNavigate();
  const access = useAccessStore();

  const loginInfo = {
    password: "",
    username: "",
  };

  const usernameUpdate = (e: string) => {
    loginInfo.username = e;
  };

  const passwoardUpdate = (e: string) => {
    loginInfo.password = e;
  };

  const goHome = () => {
    showToast("登录中, 请稍后...");
    fetch("https://api.chatkore.com/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInfo),
    })
      .then(function (res) {
        if (res.status === 200) {
          return res.json();
        } else {
          return Promise.reject(res.json());
        }
      })
      .then(function (data) {
        if (data.code === 0) {
          showToast("登录成功！");
          localStorage.setItem("SECRET_TOKEN", data.data);
          localStorage.setItem("SECRET_TOKEN", data.data.token);
          return navigate(Path.Home);
        } else {
          showToast(data.message);
        }
      })
      .catch(function (err) {
        showToast("登录失败，请重试！");
        console.log(err);
      });
  };

  const goRegister = () => {
    window.open("https://www.chatkore.com/index_gpt.html#/login", "_blank");
  };

  // const goHome = () => navigate(Path.Home);
  //
  // useEffect(() => {
  //   if (getClientConfig()?.isApp) {
  //     navigate(Path.Settings);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <div className={styles["auth-page"]}>
      <div className={`no-dark ${styles["auth-logo"]}`}>
        <BotIcon />
      </div>

      <div className={styles["auth-title"]}>请登录ChatKore</div>
      <div className={styles["auth-tips"]}>请输入邮箱和密码登录</div>

      <input
        className={styles["auth-input"]}
        placeholder="请输入邮箱"
        type="text"
        onChange={(e) => {
          usernameUpdate(e.currentTarget.value);
        }}
      />

      <input
        className={styles["auth-input"]}
        type="password"
        placeholder="请输入密码"
        value={access.accessCode}
        onChange={(e) => {
          passwoardUpdate(e.currentTarget.value);
        }}
      />

      <div className={styles["auth-actions"]}>
        <IconButton text="登 录" type="primary" onClick={goHome} />
        <IconButton text="无账号去注册" onClick={goRegister} />
      </div>
    </div>
  );
}
