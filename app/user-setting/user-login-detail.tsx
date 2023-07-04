import { useState } from "react";

import styles from "../components/settings.module.scss";

import LeftIcon from "../icons/left.svg";
import CloseIcon from "../icons/close.svg";
import { NavigateFunction } from "react-router";

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

import zBotServiceClient, {
  UserCheckResultVO,
  LocalStorageKeys,
  UserRequestInfoVO,
  UserInfoVO,
  UserConstantVO,
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

const toSignin = async (email: string) => {
  try {
    const result = await zBotServiceClient.signin(email);
    if (result === UserCheckResultVO.success) {
      // if sign in, then user can directly use the bot
      localStorage.setItem(LocalStorageKeys.userHasCoins, "true");
      showToast("签到成功");
    } else if (result === UserCheckResultVO.notFound) {
      showToast("邮箱尚未注册, 请先注册");
    } else if (result === UserCheckResultVO.Signined) {
      showToast("今日已签到, 无须多次签到");
    } else {
      showToast("签到失败, 请重新签到");
    }
  } catch (error) {
    console.log("db access failed:"), error;
  }
};

function UserbalanceInfo(userEmail: string) {
  const [userRequestInfoVO, setuserRequestInfoVO] = useState(
    new UserRequestInfoVO(),
  );
  zBotServiceClient.getRequestInfo(userEmail).then((item) => {
    setuserRequestInfoVO(item);
  });

  const [userConstantVO, setUserConstantVO] = useState(new UserConstantVO());
  zBotServiceClient.getConstant().then((item) => {
    setUserConstantVO(item);
  });

  return (
    <List>
      <ListItem
        title="签到领取AI币"
        subTitle={`每日签到领取${userConstantVO.dayBaseCoins}个基础AI币,${userConstantVO.dayLimitCoins}个限时AI币`}
      >
        <label>
          {" "}
          {"已累计签到 " + `${userRequestInfoVO.totalSigninDays}` + "天"}
        </label>

        {userRequestInfoVO.isThisDaySignin === true ? (
          <IconButton text={"今日已签到"} bordered disabled />
        ) : (
          <IconButton
            text={"去签到"}
            bordered
            onClick={() => toSignin(userEmail)}
          />
        )}
      </ListItem>
      <ListItem title="基础AI币余额" subTitle="不会清空, 注册+邀请+签到 等获取">
        <label> {userRequestInfoVO.baseCoins}</label>
      </ListItem>
      <ListItem title="限时AI币余额" subTitle={`限时1天, 0点清空`}>
        <label> {userRequestInfoVO.signinDayCoins}</label>
      </ListItem>
      <ListItem title="每条消息消耗AI币" subTitle="先限时币, 再基础币">
        <label> {1}</label>
      </ListItem>

      <ListItem title="总消息数">
        <label> {userRequestInfoVO.totalRequests}</label>
      </ListItem>
      {/* <ListItem title="升级服务">
        <IconButton
          text="升级"
          bordered
          onClick={() => showToast("开发小哥加班加点中, 敬请期待")}
        />
      </ListItem> */}
    </List>
  );
}

export function UserLoginDetail() {
  let userEmail = localStorage.getItem(LocalStorageKeys.userEmail) as string;

  const navigate = useNavigate();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  const [userNickName, setuserNickName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [updateButton, setUpdateButton] = useState(false);

  // db UserInfo value
  const [dbUserInfoVO, setDbUserInfoVO] = useState(new UserInfoVO());
  zBotServiceClient.getUserInfo(userEmail).then((item) => {
    setDbUserInfoVO(item);
  });

  // to update db
  let userInfoVO = new UserInfoVO();
  userInfoVO.email = userEmail;
  userInfoVO.nickName = userNickName;
  userInfoVO.occupation = occupation;

  function UserInfoWindowHeader({ navigate }: { navigate: NavigateFunction }) {
    return (
      <div className="window-header">
        <div className="window-header-title">
          <div className="window-header-main-title">{"用户信息"}</div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<LeftIcon />}
              onClick={() => {
                updateButton && submitChange(userInfoVO); // save change
                navigate(Path.Settings);
              }}
              bordered
              title="返回"
            ></IconButton>
          </div>
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => {
                updateButton && submitChange(userInfoVO); // save change
                navigate(Path.Home);
              }}
              bordered
              title={"关闭"}
            />
          </div>
        </div>
      </div>
    );
  }

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
              defaultValue={dbUserInfoVO.nickName}
              onChange={(e) => {
                setUpdateButton(true);
                setuserNickName(e.target.value);
              }}
            ></input>
          </ListItem>
          <ListItem title="职业*">
            <input
              type="text"
              name="occupation"
              placeholder="职业"
              defaultValue={dbUserInfoVO.occupation}
              onChange={(e) => {
                setUpdateButton(true);
                setOccupation(e.target.value);
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

        {UserbalanceInfo(userEmail)}

        <ListItem title="">
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"退出登录"}
              type="primary"
              onClick={() => {
                showToast("退出登录成功");
                // remove all local save
                localStorage.removeItem(LocalStorageKeys.userEmail);
                localStorage.removeItem(LocalStorageKeys.userHasCoins);
                navigate(Path.Settings);
              }}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
