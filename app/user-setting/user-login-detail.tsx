import { useState } from "react";

import styles from "../components/settings.module.scss";
import SendWhiteIcon from "../icons/send-white.svg";
import { List, ListItem, Popover, showToast } from "../components/ui-lib";

import { useAppConfig } from "../store";

import { IconButton } from "../components/button";

import Locale from "../locales";
import { Path } from "../constant";
import { ErrorBoundary } from "../components/error";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "../components/emoji";
import { UserInfoWindowHeader } from "./user-common";

import zBotServiceClient, {
  UserCheckResultVO,
  LocalStorageKeys,
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
  let userEmail = localStorage.getItem(LocalStorageKeys.userEmail) as string;

  const navigate = useNavigate();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const [userNickName, setUserNickName] = useState("");
  const [occupation, setOccupation] = useState("");

  // db UserInfo value
  const [dbUserInfoVO, setDbUserInfoVO] = useState(new UserInfoVO());
  zBotServiceClient.getUserInfo(userEmail).then((item) => {
    setDbUserInfoVO(item);
  });

  const saveUserInfo = async () => {
    let _userInfoVO = new UserInfoVO();
    _userInfoVO.email = userEmail;
    _userInfoVO.nickName =
      userNickName === "" ? dbUserInfoVO.nickName : userNickName;
    _userInfoVO.occupation =
      occupation === "" ? dbUserInfoVO.occupation : occupation;
    // _userInfoVO.inviterEmail = dbUserInfoVO.inviterEmail;  // inviterEmail 不可修改 in backend

    submitChange(_userInfoVO);
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader(navigate, "用户个人中心")} </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem title="邮箱*">
            <label>{userEmail}</label>
          </ListItem>
          <ListItem title="昵称*">
            <input
              type="text"
              name="username"
              placeholder="加载中..."
              defaultValue={dbUserInfoVO.nickName}
              onInput={(e) => {
                setUserNickName(e.currentTarget.value);
              }}
            ></input>
          </ListItem>
          <ListItem title="职业*">
            <input
              type="text"
              name="occupation"
              placeholder="加载中..."
              defaultValue={dbUserInfoVO.occupation}
              onInput={(e) => {
                setOccupation(e.currentTarget.value);
              }}
            ></input>
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

          <ListItem title={"邀请人"}>
            <label>{dbUserInfoVO.inviterEmail}</label>
          </ListItem>
        </List>

        <ListItem title="">
          {/* {

          } */}
          <IconButton
            icon={<SendWhiteIcon />}
            text={"保存修改"}
            type="primary"
            onClick={saveUserInfo}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={"退出登录"}
            type="primary"
            onClick={() => {
              showToast("退出登录成功");
              // remove all local save
              localStorage.removeItem(LocalStorageKeys.userEmail);
              navigate(Path.Settings);
            }}
          />
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
