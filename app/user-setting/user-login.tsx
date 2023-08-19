import { useState } from "react";

import styles from "../components/settings.module.scss";

import SendWhiteIcon from "../icons/send-white.svg";
import { List, ListItem, showToast } from "../components/ui-lib";

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
      showToast("邮箱不可为空");
      return;
    } else if (userLoginVO.verifyCode === 0) {
      showToast("验证码不可为空");
      return;
    }

    try {
      const result = await zBotServiceClient.login(userLoginVO);

      if (result === UserCheckResultVO.emailInvalid) {
        showToast("邮箱格式错误, 请重新输入");
      } else if (result === UserCheckResultVO.verifyCodeInvalid) {
        showToast("验证码错误, 请重新输入");
      } else if (result === UserCheckResultVO.notFound) {
        showToast("该邮箱尚未注册, 请先注册");
      } else if (result === UserCheckResultVO.success) {
        // save to local storage, and load it when submit message
        localStorage.setItem(LocalStorageKeys.userEmail, userLoginVO.email);
        showToast("登录成功，欢迎回来！");
        navigate(Path.Home); // go to home page
      } else {
        showToast("登录失败, 请重新输入");
      }
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader(navigate, "用户登录")} </div>

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
          <ListItem title={"邮箱验证码*"}>
            <input
              type="number"
              name="phonecode"
              placeholder="验证码"
              defaultValue={""}
              onChange={(e) => setVerifyCode(Number(e.target.value))}
            ></input>
            <IconButton
              text={"发送验证码"}
              bordered
              onClick={() => sendVerifyCode(userEmail)}
            />
          </ListItem>
        </List>

        <ListItem title="">
          {/* an empty button for placeholder */}
          {<IconButton />}
          {
            <IconButton
              icon={<SendWhiteIcon />}
              text={"登录"}
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
              text={"注册"}
              onClick={() => navigate(Path.UserRegister)}
            />
          }
        </ListItem>
      </div>
    </ErrorBoundary>
  );
}
