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

import { useAppConfig } from "../store";

import { IconButton } from "../components/button";

import Locale from "../locales";
import Link from "next/link";
import { Path } from "../constant";
import { ErrorBoundary } from "../components/error";
import { InputRange } from "../components/input-range";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "../components/emoji";

import zBotServiceClient, {
  UserCheckResultVO,
  UserLoginVO,
  userLocalStorage,
  UserInfoVO,
} from "../zbotservice/ZBotServiceClient";

const loginCheck = async (userLoginVO: UserLoginVO) => {
  console.log("login checking: userLoginVO= ", userLoginVO);

  if (userLoginVO.email.trim().length === 0) {
    showToast("邮箱不可为空");
    return;
  } else if (userLoginVO.password.trim().length === 0) {
    showToast("密码不可为空");
    return;
  }

  try {
    const result = await zBotServiceClient.login(userLoginVO);
    console.log(`login check result: `, result);

    if (result === UserCheckResultVO.success) {
      // save to local storage, and load it when submit message
      userLocalStorage.set(userLoginVO.email);
      showToast("登录成功, 请关闭窗口");
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

const loginUpdateCheck = async (userInfoVO: UserInfoVO) => {
  console.log("loginUpdateCheck: userInfoVO= ", userInfoVO);

  if (userInfoVO.nickName.trim().length === 0) {
    showToast("昵称不可为空");
    return;
  } else if (userInfoVO.occupation.trim().length === 0) {
    showToast("职业不可为空");
    return;
  }

  try {
    const result = await zBotServiceClient.updateInfo(userInfoVO);
    console.log(`login check result: `, result);

    if (result === UserCheckResultVO.success) {
      showToast("信息更新成功");
    } else if (result === UserCheckResultVO.notFound) {
      showToast("邮箱尚未注册, 请先注册");
    } else {
      showToast("更新失败, 请重新输入");
    }
  } catch (error) {
    console.log("db access failed:"), error;
  }
};

export function UserToLogin() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  let userLoginVO: UserLoginVO = { email: userEmail, password: password };

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
                loginCheck(userLoginVO);
              }}
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

export function UserLogined(userEmail: string) {
  const navigate = useNavigate();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  // const [userEmail, setUserEmail] = useState("");
  const [userNickName, setuserNickName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [updateButton, setUpdateButton] = useState(false);

  let userInfo = zBotServiceClient.getUserInfo(userEmail);
  userInfo.then((value) => {
    setuserNickName(value.nickName);
    setOccupation(value.occupation);
  });

  let userInfoVO: UserInfoVO = {
    email: userEmail,
    nickName: userNickName,
    occupation: occupation,
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
          <ListItem title="昵称*">
            <input
              type="text"
              name="username"
              placeholder="昵称"
              defaultValue={userNickName}
              onChange={() => {
                setUpdateButton(true);
              }}
            ></input>
          </ListItem>
          <ListItem title="职业*">
            <input
              type="text"
              name="username"
              placeholder="职业"
              defaultValue={occupation}
              onChange={() => {
                setUpdateButton(true);
              }}
            ></input>
            {/* <text> occupation </text> */}
          </ListItem>

          {/* TODO: Adding user png as avatar */}
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>

          <ListItem title={"密码"}>
            {
              <IconButton
                icon={<EditIcon />}
                text={"修改"}
                onClick={() => navigate(Path.UserPasswordReset)}
              />
            }
          </ListItem>
        </List>

        <ListItem title="">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"提交修改"}
              disabled={!updateButton}
              onClick={() => loginUpdateCheck(userInfoVO)}
            />
          }
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"退出登录"}
              type="primary"
              onClick={() => {
                userLocalStorage.remove();
                navigate(Path.Chat);
              }}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}

export function UserLogin() {
  let userEmail = userLocalStorage.get();

  if (userEmail === null || userEmail === undefined || userEmail === "") {
    return UserToLogin();
  }
  return UserLogined(userEmail);
}
