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

const submitChange = async (userInfoVO: UserInfoVO) => {
  if (userInfoVO.nickName.trim().length === 0) {
    showToast("昵称不可为空");
    return;
  } else if (userInfoVO.occupation.trim().length === 0) {
    showToast("职业不可为空");
    return;
  }

  try {
    const result = await zBotServiceClient.updateInfo(userInfoVO);
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

export function UserLoginDetail() {
  let userEmail = userLocalStorage.get() as string;

  const navigate = useNavigate();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const [userNickName, setuserNickName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [updateButton, setUpdateButton] = useState(false);

  // the dault value should not be userNickName, otherwise, the modify will not work
  const [userNickNameDault, setuserNickNameDault] = useState("");
  const [occupationDefault, setOccupationDefault] = useState("");
  const [userInviterDefault, setUserInviterDefault] = useState("");

  let userInfo = zBotServiceClient.getUserInfo(userEmail);
  userInfo.then((value) => {
    setuserNickNameDault(value.nickName);
    setOccupationDefault(value.occupation);
    setUserInviterDefault(value.inviter);
  });

  let userInfoVO: UserInfoVO = {
    email: userEmail,
    nickName: userNickName,
    occupation: occupation,
    inviter: userInviterDefault, // inviter can not be changed
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader({ navigate })} </div>

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
              defaultValue={userNickNameDault}
              onChange={(e) => {
                setUpdateButton(true);
                setuserNickName(e.target.value);
              }}
            ></input>
          </ListItem>
          <ListItem title="职业*">
            <input
              type="text"
              name="username"
              placeholder="职业"
              defaultValue={occupationDefault}
              onChange={(e) => {
                setUpdateButton(true);
                setOccupation(e.target.value);
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
          <ListItem title={"邀请人"}>
            <label>{userInviterDefault}</label>
          </ListItem>
        </List>

        <ListItem title="">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"提交修改"}
              disabled={!updateButton}
              onClick={() => submitChange(userInfoVO)}
            />
          }
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"退出登录"}
              type="primary"
              onClick={() => {
                showToast("退出登录成功");
                userLocalStorage.remove();
                navigate(Path.Settings);
              }}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
