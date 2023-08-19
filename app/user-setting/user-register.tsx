import { useState } from "react";

import styles from "../components/settings.module.scss";
import SendWhiteIcon from "../icons/send-white.svg";

import { List, ListItem, showToast } from "../components/ui-lib";

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
      showToast("邮箱不可为空");
      return;
    } else if (userRegisterVO.nickName.trim().length === 0) {
      showToast("昵称不可为空");
      return;
    } else if (userRegisterVO.verifyCode === 0) {
      showToast("邮箱验证码不可为空");
      return;
    } else if (userRegisterVO.occupation.trim().length === 0) {
      showToast("职业不可为空");
      return;
    }

    // register to db
    try {
      const result = await zBotServiceClient.register(userRegisterVO);
      if (result === UserCheckResultVO.emailInvalid) {
        showToast("该邮箱格式不正确, 请重新输入");
      } else if (result === UserCheckResultVO.emailConflict) {
        showToast("该邮箱已被注册, 请重新输入");
      } else if (result === UserCheckResultVO.verifyCodeInvalid) {
        showToast("验证码不正确, 请重新输入");
      } else if (result === UserCheckResultVO.success) {
        showToast("注册成功, 已自动登录");
        localStorage.setItem(LocalStorageKeys.userEmail, userRegisterVO.email);
        navigate(Path.UserLoginDetail);
      } else {
        showToast("注册失败, 请再次尝试");
      }
    } catch (error) {
      console.log("db access failed:", error);
    }
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader(navigate, "用户注册中心")} </div>

      <div className={styles["settings"]}>
        <List>
          <ListItem
            title="邮箱*"
            subTitle="-邮箱仅用来区分用户, 不会访问个人信息"
          >
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
              name="emailcode"
              placeholder="验证码"
              onChange={(e) => setVerifyCode(Number(e.target.value))}
            ></input>
            <IconButton
              text={"发送验证码"}
              bordered
              onClick={() => sendVerifyCode(userEmail)}
            />
          </ListItem>
          <ListItem title="昵称*">
            <input
              type="text"
              name="username"
              placeholder="昵称"
              onChange={(e) => setNickName(e.target.value)}
            ></input>
          </ListItem>
          <ListItem title={"职业*"}>
            <input
              type="text"
              name="occupation"
              placeholder="职业"
              onChange={(e) => setOccupation(e.target.value)}
            />
          </ListItem>
          <ListItem
            title={"邀请人邮箱"}
            subTitle={`-可选. 邀请人和被邀请人均可获取+${userConstantVO.inviteBaseCoins}AI币`}
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
