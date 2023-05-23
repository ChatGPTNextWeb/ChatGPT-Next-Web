import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "../components/settings.module.scss";

import SendWhiteIcon from "../icons/send-white.svg";
import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showToast,
} from "../components/ui-lib";

import { useAppConfig } from "../store";

import { IconButton } from "../components/button";

import Locale from "../locales";
import Link from "next/link";
import { Path } from "../constant";
import { ErrorBoundary } from "../components/error";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "../components/emoji";
import { UserInfoWindowHeader } from "./user-common";

import zBotServiceClient, {
  UserCheckResultVO,
  UserLoginVO,
  userLocalStorage,
  UserInfoVO,
} from "../zbotservice/ZBotServiceClient";

export function UserLogin() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  let userLoginVO: UserLoginVO = { email: userEmail, password: password };

  // put as within function, so that the hooks nvvigate can be used
  const submitLogin = async (userLoginVO: UserLoginVO) => {
    if (userLoginVO.email.trim().length === 0) {
      showToast("邮箱不可为空");
      return;
    } else if (userLoginVO.password.trim().length === 0) {
      showToast("密码不可为空");
      return;
    }

    try {
      const result = await zBotServiceClient.login(userLoginVO);
      if (result === UserCheckResultVO.success) {
        // save to local storage, and load it when submit message
        userLocalStorage.set(userLoginVO.email);
        showToast("登录成功，欢迎回来！");
        navigate(Path.Home); // go to home page
      } else if (result === UserCheckResultVO.emailInvalid) {
        showToast("邮箱格式不争取, 请重新输入");
      } else if (result === UserCheckResultVO.notFound) {
        showToast("邮箱尚未注册, 请先注册");
      } else if (result === UserCheckResultVO.passwordError) {
        showToast("密码错误, 请重新输入");
      } else {
        showToast("登录失败, 请重新输入");
      }
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader({ navigate })} </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem title="邮箱*">
            <input
              type="text"
              name="useremail"
              placeholder="邮箱不可重复"
              onChange={(e) => setUserEmail(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title="密码*">
            <input
              type="password"
              name="password"
              placeholder="字母、数字或下划线组成"
              onChange={(e) => setPassword(e.target.value)}
            />
          </ListItem>
        </List>

        <ListItem title="">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"登录"}
              type="primary"
              onClick={() => {
                submitLogin(userLoginVO);
              }}
            />
          }
        </ListItem>

        <ListItem title="更多选项">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"重置密码"}
              onClick={() => navigate(Path.UserPasswordReset)}
            />
          }
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"注册"}
              onClick={() => navigate(Path.UserRegister)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
