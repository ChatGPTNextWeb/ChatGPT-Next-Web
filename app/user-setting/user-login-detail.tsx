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
    showToast(Locale.Settings.UserLogin.LoginCenter.SubmitToast.NullNickName);
    return;
  } else if (userInfoVO.occupation.trim().length === 0) {
    showToast(Locale.Settings.UserLogin.LoginCenter.SubmitToast.NullOccupation);
    return;
  }

  try {
    const result = await zBotServiceClient.updateInfo(userInfoVO);
    if (result === UserCheckResultVO.success) {
      showToast(Locale.Settings.UserLogin.LoginCenter.SubmitToast.Success);
    } else if (result === UserCheckResultVO.notFound) {
      showToast(Locale.Settings.UserLogin.LoginCenter.SubmitToast.NotRegister);
    } else {
      showToast(Locale.Settings.UserLogin.LoginCenter.SubmitToast.Failed);
    }
  } catch (error) {
    console.log(Locale.Settings.UserLogin.LoginCenter.SubmitToast.Failed),
      error;
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
      <div>
        {" "}
        {UserInfoWindowHeader(
          navigate,
          Locale.Settings.UserLogin.LoginCenter.Title,
        )}{" "}
      </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem title={Locale.Settings.UserLogin.LoginCenter.Email.Title}>
            <label>{userEmail}</label>
          </ListItem>
          <ListItem
            title={Locale.Settings.UserLogin.LoginCenter.NickName.Title}
          >
            <input
              type="text"
              name="username"
              defaultValue={dbUserInfoVO.nickName}
              onInput={(e) => {
                setUserNickName(e.currentTarget.value);
              }}
            ></input>
          </ListItem>
          <ListItem
            title={Locale.Settings.UserLogin.LoginCenter.Occupation.Title}
          >
            <input
              type="text"
              name="occupation"
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

          <ListItem title={Locale.Settings.UserLogin.LoginCenter.Inviter.Title}>
            <label>{dbUserInfoVO.inviterEmail}</label>
          </ListItem>
        </List>

        <ListItem title="">
          <IconButton
            icon={<SendWhiteIcon />}
            text={Locale.Settings.UserLogin.LoginCenter.SaveButton}
            type="primary"
            onClick={saveUserInfo}
          />
          <IconButton
            icon={<SendWhiteIcon />}
            text={Locale.Settings.UserLogin.LoginCenter.SubmitButton}
            type="primary"
            onClick={() => {
              showToast(
                Locale.Settings.UserLogin.LoginCenter.SubmitToast.LoginOut,
              );
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
