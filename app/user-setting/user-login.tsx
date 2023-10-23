import { useState } from "react";

import styles from "../components/settings.module.scss";

import SendWhiteIcon from "../icons/send-white.svg";
import { List, ListItem, showToast } from "../components/ui-lib";
import Locale from "../locales";

import { IconButton } from "../components/button";
import { Path } from "../constant";
import { ErrorBoundary } from "../components/error";
import { useNavigate } from "react-router-dom";
import { UserInfoWindowHeader } from "./user-common";

import zBotServiceClient, {
  UserCheckResultVO,
  UserLoginVO,
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode } from "./user-common";

export function UserLogin() {
  const navigate = useNavigate();

  const [userEmail, setUserEmail] = useState("");
  const [verifyCode, setVerifyCode] = useState(0);

  let userLoginVO: UserLoginVO = { email: userEmail, verifyCode: verifyCode };

  // put as within function, so that the hooks nvvigate can be used
  const submitLogin = async (userLoginVO: UserLoginVO) => {
    if (userLoginVO.email.trim().length === 0) {
      showToast(Locale.Settings.UserNotLogin.LoginCenter.LoginToast.EmailEmpty);
      return;
    } else if (userLoginVO.verifyCode === 0) {
      showToast(
        Locale.Settings.UserNotLogin.LoginCenter.LoginToast.EmailVerifyEmpty,
      );
      return;
    }

    try {
      const result = await zBotServiceClient.login(userLoginVO);

      if (result === UserCheckResultVO.emailInvalid) {
        showToast(
          Locale.Settings.UserNotLogin.LoginCenter.LoginToast.EmailInvalid,
        );
      } else if (result === UserCheckResultVO.verifyCodeInvalid) {
        showToast(
          Locale.Settings.UserNotLogin.LoginCenter.LoginToast
            .EmailVerifyInvalid,
        );
      } else if (result === UserCheckResultVO.notFound) {
        showToast(
          Locale.Settings.UserNotLogin.LoginCenter.LoginToast.NotRegister,
        );
      } else if (result === UserCheckResultVO.success) {
        // save to local storage, and load it when submit message
        localStorage.setItem(LocalStorageKeys.userEmail, userLoginVO.email);
        showToast(Locale.Settings.UserNotLogin.LoginCenter.LoginToast.Success);
        navigate(Path.Home); // go to home page
      } else {
        showToast(Locale.Settings.UserNotLogin.LoginCenter.LoginToast.Failed);
      }
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <ErrorBoundary>
      <div>
        {" "}
        {UserInfoWindowHeader(
          navigate,
          Locale.Settings.UserNotLogin.LoginCenter.Title,
        )}{" "}
      </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem
            title={Locale.Settings.UserNotLogin.LoginCenter.Email.Title}
          >
            <input
              type="text"
              name="useremail"
              onChange={(e) => setUserEmail(e.target.value)}
            ></input>
          </ListItem>
          <ListItem
            title={Locale.Settings.UserNotLogin.LoginCenter.EmailVerify.Title}
          >
            <IconButton
              text={Locale.Settings.UserNotLogin.LoginCenter.EmailVerify.Button}
              bordered
              onClick={() => sendVerifyCode(userEmail)}
            />
            <input
              type="text"
              name="phonecode"
              defaultValue={""}
              onChange={(e) => setVerifyCode(Number(e.target.value))}
            ></input>
          </ListItem>
        </List>

        <ListItem title="">
          {/* an empty button for placeholder */}
          {<IconButton />}
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={Locale.Settings.UserNotLogin.LoginCenter.LoginButton}
              type="primary"
              onClick={() => {
                submitLogin(userLoginVO);
              }}
            />
          }
          {
            <IconButton
              // icon={<SendWhiteIcon />}
              bordered
              text={Locale.Settings.UserNotLogin.LoginCenter.RegisterButton}
              onClick={() => navigate(Path.UserRegister)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
