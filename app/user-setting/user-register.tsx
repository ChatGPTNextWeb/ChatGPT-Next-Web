import { useState } from "react";

import styles from "../components/settings.module.scss";
import SendWhiteIcon from "../icons/send-white.svg";

import { List, ListItem, showToast } from "../components/ui-lib";
import Locale from "../locales";

import { IconButton } from "../components/button";
import { Path, UPDATE_URL } from "../constant";
import { ErrorBoundary } from "../components/error";
import { useNavigate } from "react-router-dom";

import zBotServiceClient, {
  UserCheckResultVO,
  UserRegisterVO,
  LocalStorageKeys,
  UserConstantVO,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode, UserInfoWindowHeader } from "./user-common";

export function UserRegister() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [nickName, setNickName] = useState("");
  const [verifyCode, setVerifyCode] = useState(0);
  const [occupation, setOccupation] = useState("");
  const [inviterEmail, setInviterEmail] = useState("");

  var userRegisterVO: UserRegisterVO = {
    email: userEmail,
    nickName: nickName,
    occupation: occupation,
    inviterEmail: inviterEmail,
    verifyCode: Number(verifyCode),
  };

  const [userConstantVO, setUserConstantVO] = useState(new UserConstantVO());
  zBotServiceClient.getConstant().then((item) => {
    setUserConstantVO(item);
  });

  const submit = async (userRegisterVO: UserRegisterVO) => {
    if (userRegisterVO.email.trim().length === 0) {
      showToast(
        Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast.EmailEmpty,
      );
      return;
    } else if (userRegisterVO.nickName.trim().length === 0) {
      showToast(
        Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast.NickNameEmpty,
      );
      return;
    } else if (userRegisterVO.verifyCode === 0) {
      showToast(
        Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast
          .EmailVerifyEmpty,
      );
      return;
    } else if (userRegisterVO.occupation.trim().length === 0) {
      showToast(
        Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast
          .OccupationEmpty,
      );
      return;
    }

    // register to db
    try {
      const result = await zBotServiceClient.register(userRegisterVO);
      if (result === UserCheckResultVO.emailInvalid) {
        showToast(
          Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast
            .EmailInvalid,
        );
      } else if (result === UserCheckResultVO.emailConflict) {
        showToast(
          Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast.HasRegister,
        );
      } else if (result === UserCheckResultVO.verifyCodeInvalid) {
        showToast(
          Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast
            .EmailVerifyInvalid,
        );
      } else if (result === UserCheckResultVO.success) {
        showToast(
          Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast.Success,
        );
        localStorage.setItem(LocalStorageKeys.userEmail, userRegisterVO.email);
        navigate(Path.UserLoginDetail);
      } else {
        showToast(
          Locale.Settings.UserNotLogin.RegisterCenter.RegisterToast.Failed,
        );
      }
    } catch (error) {
      console.log("db access failed:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div>
        {" "}
        {UserInfoWindowHeader(
          navigate,
          Locale.Settings.UserNotLogin.RegisterCenter.Title,
        )}{" "}
      </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem
            title={Locale.Settings.UserNotLogin.RegisterCenter.Email.Title}
          >
            <input
              type="text"
              name="useremail"
              onChange={(e) => setUserEmail(e.target.value)}
            ></input>
          </ListItem>
          <ListItem
            title={
              Locale.Settings.UserNotLogin.RegisterCenter.EmailVerify.Title
            }
          >
            <IconButton
              text={
                Locale.Settings.UserNotLogin.RegisterCenter.EmailVerify.Button
              }
              bordered
              onClick={() => sendVerifyCode(userEmail)}
            />
            <input
              type="text"
              name="emailcode"
              onChange={(e) => setVerifyCode(Number(e.target.value))}
            ></input>
          </ListItem>
          <ListItem
            title={Locale.Settings.UserNotLogin.RegisterCenter.NickName.Title}
          >
            <input
              type="text"
              name="username"
              onChange={(e) => setNickName(e.target.value)}
            ></input>
          </ListItem>
          <ListItem
            title={
              Locale.Settings.UserNotLogin.RegisterCenter.Occupuation.Title
            }
          >
            <input
              type="text"
              name="occupation"
              onChange={(e) => setOccupation(e.target.value)}
            />
          </ListItem>
          <ListItem
            title={Locale.Settings.UserNotLogin.RegisterCenter.Inviter.Title}
            subTitle={Locale.Settings.UserNotLogin.RegisterCenter.Inviter.SubTitle(
              userConstantVO.inviteBaseCoins,
            )}
          >
            <input
              type="text"
              name="inviteremail"
              placeholder="xxx@example.com"
              onChange={(e) => setInviterEmail(e.target.value)}
            />
          </ListItem>
        </List>

        <ListItem title="">
          {/* {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"登录"}
              onClick={() => navigate(Path.UserLogin)}
            />
          } */}
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"注册"}
              type="primary"
              onClick={() => submit(userRegisterVO)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
