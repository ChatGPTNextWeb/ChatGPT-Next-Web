import { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles from "../components/settings.module.scss";
import styles_uilib from "../components/ui-lib.module.scss";
import styles_user from "./user.module.scss";

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

import {
  zCareersPayClient,
  QrCodeAdress,
  UserPayVO,
  UserPayResponseVO,
} from "../zcareerspay/ZCareersPayClient";

import zBotServiceClient, {
  UserCheckResultVO,
  UserLoginVO,
  LocalStorageKeys,
} from "../zbotservice/ZBotServiceClient";
import { sendVerifyCode } from "./user-common";

export function UserOrder() {
  const navigate = useNavigate();

  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [amount, setAmount] = useState(0);

  const submit = async (amount: number, baseCoins: number) => {
    setShowQrCode(true);
    setQrCodeUrl("");
    setAmount(amount);

    let userEmail = localStorage.getItem(LocalStorageKeys.userEmail) as string;
    if (userEmail === null) {
      showToast("您尚未登录, 请前往设置中心登录");
      return;
    }

    let amount_cent = amount * 100;
    let userPayVO: UserPayVO = {
      email: userEmail,
      amount: amount_cent,
      base_coins: baseCoins,
      mode: 1,
    };

    try {
      const result = await zCareersPayClient.pay(userPayVO);
      setQrCodeUrl(result.code_url);
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader({ navigate })} </div>

      <div className={styles["settings"]}>
        {/* <List>
          <ListItem title="0.01元 套餐" subTitle="娱乐至上">
            {
              <IconButton
                text={"充值"}
                type="primary"
                onClick={() => submit(0.01, 1)}
              />
            }
          </ListItem>
        </List> */}
        <List>
          <ListItem
            title="10元 套餐"
            subTitle="100 个AI币, 100次问答, 小试牛刀"
          >
            {
              <IconButton
                text={"充值"}
                type="primary"
                onClick={() => submit(10, 100)}
              />
            }
          </ListItem>
        </List>
        <List>
          <ListItem
            title="30元 套餐"
            subTitle="500 个AI币, 500次问答，物美价廉"
          >
            {
              <IconButton
                text={"充值"}
                type="primary"
                onClick={() => submit(30, 500)}
              />
            }
          </ListItem>
        </List>
        {/* <List>
          <ListItem title="68元 包月套餐" subTitle="30天内: 每日100次问答上限, 尽情畅聊">
            {
              <IconButton
                text={"充值"}
                type="primary"
                onClick={() => submit(68, 150)}
              />
            }
          </ListItem>
        </List> */}
        {showQrCode &&
          (qrCodeUrl === "" ? (
            <div className={styles_uilib["list-center"]}>
              <text className={styles_user["user-order-code"]}>
                {" "}
                {`支付二维码 加载中...`}{" "}
              </text>
            </div>
          ) : (
            <div className={styles_uilib["list-center"]}>
              <text className={styles_user["user-order-code"]}>
                {" "}
                {`您已选择${amount}元套餐, 请用微信扫一扫支付`}{" "}
              </text>
              <div className={styles_user["user-order-code"]}>
                <img
                  src={`${QrCodeAdress}?size=200x200&data=${qrCodeUrl}`}
                  alt="QR Code"
                />
              </div>
            </div>
          ))}
      </div>
    </ErrorBoundary>
  );
}
