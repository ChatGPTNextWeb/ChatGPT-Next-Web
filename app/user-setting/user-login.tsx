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

const hasRegister = async (account: string) => {
  console.log("enter hasRegister: ", account);
  try {
    zBotServiceClient.getUserInfo(3).then((res) => {
      console.log(`res.id: ${res.id}, res.name: ${res.name}`);

      if (res.name == account) {
        console.log("hasRegister1: ", res.name);
        showToast("登录成功, 请关闭窗口");
        return true;
      } else {
        showToast("账号尚未注册, 请先注册");
        console.log("hasRegister2: ", res.name);
        return false;
      }
      // zBotServiceClient.getHealth().then((res) => {
      //   if (res == true) {
      //     console.log("hasRegister: ", res)
      //     showToast("登录成功, 请关闭窗口");
      //     return res;
      //   }
      // }).catch((error) => {
      //   showToast("access db failed");
      //   console.log("access db failed:", error)
    });
  } catch (error) {
    console.log("meet error:", error);
    return false;
  }
};

export function UserLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
          <ListItem title={"密码*"}>
            <input type="password" name="password" placeholder="password" />
          </ListItem>
        </List>

        <ListItem title={""}>
          {
            <IconButton
              icon={<EditIcon />}
              text={"提交"}
              onClick={() => hasRegister(username)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
