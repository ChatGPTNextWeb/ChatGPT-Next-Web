import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "../components/settings.module.scss";

import CloseIcon from "../icons/close.svg";
import EditIcon from "../icons/edit.svg";
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

import zBotServiceClient from "../zbotservice/ZBotServiceClient";

export function UserRegister() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function loginCheck() {
    // 1. check whether register
    // if (!zBotServiceClient.hasRegister(username)) {
    //   showToast("账号尚未注册, 请先注册");
    //   return;
    // }

    // 2. check password

    // 2. update user info

    // 3. show result
    showToast("登录成功, 请关闭窗口");
  }

  return (
    <ErrorBoundary>
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{"用户信息"}</div>
          {/* <div className="window-header-sub-title">
            {Locale.Settings.SubTitle}
          </div> */}
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
        {/* Account */}
        <List>
          <ListItem title={"操作"}>
            {
              <IconButton
                icon={<EditIcon />}
                text={"登录"}
                onClick={() => navigate(Path.UserLogin)}
              />
            }
            {
              <IconButton
                icon={<EditIcon />}
                text={"注册"}
                onClick={() => navigate(Path.UserRegister)}
              />
            }
            {/* { <IconButton  icon={<EditIcon />} text={"重置密码"} onClick={() => showToast("开发中")} /> } */}
          </ListItem>

          <ListItem title={"账号*"}>
            <input
              type="text"
              name="useraccount"
              placeholder="user account"
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title={"昵称*"}>
            <input
              type="text"
              name="username"
              placeholder="user name"
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title={"电话*"}>
            <input type="text" name="phone" placeholder="phone"></input>
          </ListItem>
          <ListItem title={"密码*"}>
            <input type="password" name="password" placeholder="password" />
          </ListItem>
        </List>

        <ListItem title={""}>
          {
            <IconButton
              icon={<EditIcon />}
              text={"提交"}
              // onClick={() => showToast("开发中...")}
              onClick={loginCheck}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
