import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "../components/settings.module.scss";

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
import { UserInfoWindowHeader } from "./user-common";

import zBotServiceClient, {
  UserCheckResultVO,
  UserSecretVO,
  userLocalStorage,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode } from "./user-common";

export function UserPasswordRest() {
  const navigate = useNavigate();

  let userEmailLocal = userLocalStorage.get() as string;

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyCode, setVerifyCode] = useState("");

  let userLoginVO: UserSecretVO = {
    email: userEmail,
    password: password,
    verifyCode: Number(verifyCode),
  };

  const passwordCheck = async (userSecretVO: UserSecretVO) => {
    if (userSecretVO.email.trim().length === 0) {
      showToast("邮箱不可为空");
      return;
    }
    if (userSecretVO.verifyCode.toString().length !== 6) {
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

      if (result === UserCheckResultVO.success) {
        showToast("密码修改成功, 已自动登录");
        userLocalStorage.set(userSecretVO.email);
        navigate(Path.UserLoginDetail);
      } else if (result === UserCheckResultVO.verifyCodeInvalid) {
        showToast("验证码不正确, 请重新输入");
      } else {
        showToast("密码修改失败, 请再次尝试");
      }
    } catch (error) {
      console.log("db access failed:", error);
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
              defaultValue={userEmailLocal}
              onChange={(e) => setUserEmail(e.target.value)}
            ></input>
            {/* <label>{userEmail}</label> */}
          </ListItem>
          <ListItem title={"邮箱验证码*"}>
            <input
              type="text"
              name="phonecode"
              placeholder="验证码"
              defaultValue={""}
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
              defaultValue={""}
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
