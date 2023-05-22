import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "../components/settings.module.scss";

import CloseIcon from "../icons/close.svg";
import EditIcon from "../icons/edit.svg";
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

import { IconButton } from "../components/button";

import Locale from "../locales";
import Link from "next/link";
import { Path, UPDATE_URL } from "../constant";
import { ErrorBoundary } from "../components/error";
import { InputRange } from "../components/input-range";
import { useNavigate } from "react-router-dom";

import zBotServiceClient, {
  UserCheckResultVO,
  UserSecretVO,
  userLocalStorage,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode } from "./user-verifyCode";

const passwordCheck = async (userSecretVO: UserSecretVO) => {
  console.log("passwordCheck for user: ", userSecretVO.email);

  if (userSecretVO.email.trim().length === 0) {
    showToast("邮箱不可为空");
    return;
  }
  if (userSecretVO.verifyCode.toString().length === 6) {
    // 6 digits
    showToast("验证码不正确");
    return;
  } else if (userSecretVO.password.trim().length === 0) {
    showToast("密码不可为空");
    return;
  }

  // register to db
  try {
    const result = await zBotServiceClient.updateSecret(userSecretVO);
    console.log(`register check result: `, result);

    if (result === UserCheckResultVO.success) {
      userLocalStorage.remove();
      showToast("密码修改成功, 请返回重新登录");
    } else if (result === UserCheckResultVO.verifyCodeInvalid) {
      showToast("验证码不正确, 请重新输入");
    } else {
      showToast("密码修改失败, 请重新密码");
    }
  } catch (error) {
    console.log("db access failed:", error);
  }
};

export function UserPasswordRest() {
  const navigate = useNavigate();

  let userEmail = userLocalStorage.get() as string;

  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  let userLoginVO: UserSecretVO = {
    email: userEmail,
    password: password,
    verifyCode: Number(verifyCode),
  };

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{"用户信息"}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
              title={Locale.Settings.Actions.Close}
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem title="邮箱*">
            <label>{userEmail}</label>
          </ListItem>
          <ListItem title={"邮箱验证码*"}>
            <input
              type="text"
              name="phonecode"
              placeholder="验证码"
              onChange={(e) => setVerifyCode(e.target.value)}
            ></input>
            <IconButton
              icon={<EditIcon />}
              text={"发送验证码"}
              onClick={() => sendVerifyCode(userEmail)}
            />
          </ListItem>
          <ListItem title="新密码*" subTitle="-请尽量避免使用其他账号的密码">
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
              text={"提交修改"}
              type="primary"
              onClick={() => passwordCheck(userLoginVO)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
