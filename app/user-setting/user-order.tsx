import React, { useState, useEffect, useMemo, HTMLProps, useRef } from "react";

import styles_settings from "../components/settings.module.scss";
import styles_user from "./user.module.scss";

import { List, ListItem, showToast } from "../components/ui-lib";

import { IconButton } from "../components/button";

import { ErrorBoundary } from "../components/error";
import { useNavigate } from "react-router-dom";
import { UserInfoWindowHeader } from "./user-common";

import {
  zCareersPayClient,
  QrCodeAdress,
  UserPayVO,
} from "../zcareerspay/ZCareersPayClient";

import zBotServiceClient, {
  UserCheckResultVO,
  UserRequestInfoVO,
  UserConstantVO,
  LocalStorageKeys,
  UserOrderVO,
} from "../zbotservice/ZBotServiceClient";

// 放到这里, 方便修改
const pricingPackage = [
  { amount: 10, base_coins: 100, requests: 100 },
  { amount: 30, base_coins: 500, requests: 500 },
];

export function UserOrder() {
  const navigate = useNavigate();

  let userEmail = localStorage.getItem(LocalStorageKeys.userEmail) as string;

  return (
    <ErrorBoundary>
      <div> {UserInfoWindowHeader(navigate, "用户余额中心")} </div>

      <div className={styles_settings["settings"]}>
        {UserbalanceInfo(userEmail)}
        {/* {UserOrderInfo(userEmail)}
        {UserOrderHistory(userEmail)} */}
      </div>
    </ErrorBoundary>
  );
}

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

  const toSignin = async (email: string) => {
    try {
      const result = await zBotServiceClient.signin(email);
      if (result === UserCheckResultVO.success) {
        showToast("签到成功");
      } else if (result === UserCheckResultVO.notFound) {
        showToast("邮箱尚未注册, 请先注册");
      } else if (result === UserCheckResultVO.Signined) {
        showToast("今日已签到, 无需多次签到");
      } else {
        showToast("签到失败, 请重新签到");
      }
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <List>
      <ListItem title="账户余额"></ListItem>
      <div className={styles_user["user-order-balance"]}>
        <div className={styles_user["user-order-balance-item"]}>
          <div className={styles_user["user-order-balance-num"]}>
            {userRequestInfoVO.baseCoins}
          </div>
          <div className={styles_user["user-order-balance-title"]}>
            基础AI币余额
          </div>
          <div>(不会清空)</div>
        </div>
        <div className={styles_user["user-order-balance-item"]}>
          <div className={styles_user["user-order-balance-num"]}>
            {userRequestInfoVO.thisDayCoins}
          </div>
          <div className={styles_user["user-order-balance-title"]}>
            限时AI币余额
          </div>
          <div>(限时1天, 0点清空)</div>
        </div>
        <div className={styles_user["user-order-balance-item"]}>
          <div className={styles_user["user-order-balance-num"]}>
            {userRequestInfoVO.totalRequests}
          </div>
          <div className={styles_user["user-order-balance-title"]}>
            总对话次数
          </div>
          <div>(每条对话消耗1个AI币, 先限时币, 再基础币)</div>
        </div>
        <div className={styles_user["user-order-balance-item"]}>
          <div className={styles_user["user-order-balance-num"]}>
            {userRequestInfoVO.totalSigninDays}
          </div>
          <div className={styles_user["user-order-balance-title"]}>
            总签到天数
          </div>
          <div>
            (
            {`每日签到领取${userConstantVO.dayBaseCoins}个基础AI币,${userConstantVO.dayLimitCoins}个限时AI币`}
            )
          </div>
        </div>
      </div>

      {userRequestInfoVO.isThisDaySignin ? (
        <ListItem title="今日签到状态">
          <label className={styles_user["user-order-signed"]}>
            {"已签到 "}
          </label>
          <IconButton text={"不可重复签到"} bordered disabled />
        </ListItem>
      ) : (
        <ListItem title="今日签到状态">
          <label className={styles_user["user-order-unsigned"]}>
            {"尚未签到 "}
          </label>
          <IconButton
            text={"去签到"}
            bordered
            onClick={() => toSignin(userEmail)}
          />
        </ListItem>
      )}

      <ListItem title="AI币说明">
        <div className={styles_user["user-order-desc"]}>
          <label>{"- 新用户注册时, 赠送20个基础AI币"}</label>
          <label>{"- 邀请用户时, 邀请人和被邀请人均赠送5个基础AI币"}</label>
        </div>
        <div></div>
      </ListItem>
    </List>
  );
}

function UserOrderInfo(userEmail: string) {
  const [selectedPackage, setSelectedButton] = useState(0);

  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleButtonClick = (buttonId: number) => {
    setSelectedButton(buttonId);
    setShowQrCode(false);
    setQrCodeUrl("");
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [qrCodeUrl]);

  const submit = async () => {
    let amount = pricingPackage[selectedPackage - 1].amount;
    let baseCoins = pricingPackage[selectedPackage - 1].base_coins;

    setShowQrCode(true);
    setQrCodeUrl("");

    let amount_cent = amount * 100;
    let userPayVO: UserPayVO = {
      email: userEmail,
      amount: amount_cent,
      base_coins: baseCoins,
      mode: selectedPackage,
    };

    try {
      const result = await zCareersPayClient.pay(userPayVO);
      setQrCodeUrl(result.code_url);
    } catch (error) {
      console.log("db access failed:"), error;
    }
  };

  return (
    <List>
      <ListItem title="充值中心"></ListItem>
      <div className={styles_user["user-order-pay"]}>
        {pricingPackage.map((item, index) => {
          return (
            <label
              key={index}
              className={
                selectedPackage === index + 1
                  ? styles_user["user-order-balance-button-selected"]
                  : styles_user["user-order-balance-button"]
              }
              onClick={() => handleButtonClick(index + 1)}
            >
              <div
                className={styles_user["user-order-balance-num"]}
              >{`${item.amount}元套餐`}</div>
              <div className={styles_user["user-order-balance-title-padding"]}>
                {`${item.base_coins}个AI币, ${item.requests}次问答`}{" "}
              </div>
            </label>
          );
        })}
      </div>
      {selectedPackage > 0 ? (
        <ListItem title="套餐选择">
          <label className={styles_user["user-order-signed"]}>{`您已选择: ${
            pricingPackage[selectedPackage - 1].amount
          }元套餐`}</label>
          <IconButton text={"去充值"} type="primary" onClick={submit} />
          <div></div>
        </ListItem>
      ) : (
        <ListItem title="套餐选择">
          <label className={styles_user["user-order-unsigned"]}>
            {"尚未选择套餐, 请选择任一套餐"}
          </label>
          <div></div>
        </ListItem>
      )}

      {showQrCode ? (
        qrCodeUrl === "" ? (
          <div className={styles_user["user-order-qrcode-desc"]}>
            <text className={styles_user["user-order-qrcode"]}>
              {`支付二维码 加载中...`}
            </text>
          </div>
        ) : (
          <div className={styles_user["user-order-qrcode-desc"]}>
            <div
              className={styles_user["user-order-qrcode"]}
              ref={messagesEndRef}
            >
              <img
                src={`${QrCodeAdress}?size=200x200&data=${qrCodeUrl}`}
                alt="QR Code"
              />
            </div>
            <text className={styles_user["user-order-qrcode"]}>
              {`请用微信扫一扫支付`}
            </text>
          </div>
        )
      ) : null}
    </List>
  );
}

function UserOrderHistory(userEmail: string) {
  const [orderHistory, setOrderHistory] = useState<UserOrderVO[]>([]);

  useEffect(() => {
    zBotServiceClient.getUserOrders(userEmail).then((item) => {
      setOrderHistory(item);
    });
  }, []);

  return (
    <List>
      <ListItem title="充值历史"></ListItem>
      <div className={styles_user["order-history-container"]}>
        <table className={styles_user["order-history-table"]}>
          <thead>
            <tr>
              <th>套餐类型</th>
              <th>充值金额(元)</th>
              <th>基础AI币(个)</th>
              <th>下单时间</th>
              <th>订单完成时间</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((order, index) => (
              <tr key={index}>
                <td>{order.amount / 100}元套餐</td>
                <td>{order.amount / 100}</td>
                <td>{order.baseCoins}</td>
                <td>{order.orderTime.toString()}</td>
                <td>{order.orderCompleteTime.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </List>
  );
}
