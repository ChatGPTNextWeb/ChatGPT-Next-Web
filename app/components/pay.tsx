import { Button, IconButton } from "./button";
import styles from "./pay.module.scss";
import { Modal } from "./ui-lib";
import { useEffect, useState } from "react";
import WeixinIcon from "../icons/weixin.svg";
import { ListType } from "./records";
import QRCode from "qrcode.react";
// import { isMobileScreen } from "../utils";
import { authStore } from "../store/auth";
import { getOrderStatus, vipPay } from "../api/account";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Path } from "../constant";
let getOrderTimeout: any;
interface Order {
  code_url: string;
  orderNo: string;
  value: number;
  expireDate: dayjs.Dayjs;
  verification: boolean;
  status: ORDER_STATUS;
}

export enum ORDER_STATUS {
  COMPLETE = "COMPLETE",
  EXPIRE = "EXPIRE",
  CREATE = "CREATE",
}

export function PayModal() {
  const [prices, setPrices] = useState<number[]>([]);
  const [order, setOrder] = useState<Order>();
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [selectValue, setSelectValue] = useState<number>(1);
  const [isMode4, setIsMode4] = useState<boolean>(true);
  const navigate = useNavigate();
  const authStoreInfo: any = authStore();
  const isPayModalVisible = authStoreInfo.isPayModalVisible;
  useEffect(() => {
    setPrices(isMode4 ? [5, 6, 7] : [1, 2, 3]);
    setSelectValue(isMode4 ? 5 : 1);
  }, [isMode4]);

  async function getOrderInfo() {
    if (order) {
      const res = await getOrderStatus(order.orderNo);
      if (res.complete) {
        return ORDER_STATUS.COMPLETE;
      }
    }

    return null;
  }

  async function poolling(data: {
    fn: Function;
    time: number;
    max?: number;
  }): Promise<ORDER_STATUS> {
    const { fn, time, max } = data;

    let number = 1;
    return new Promise((resolve) => {
      const tickFn = () => {
        if (max) {
          number += 1;
        }
        clearTimeout(getOrderTimeout);
        getOrderTimeout = setTimeout(async () => {
          const data = await fn();
          if (data || (max && max <= number)) {
            resolve(data);
          } else if (order && dayjs().isAfter(order.expireDate)) {
            resolve(ORDER_STATUS.EXPIRE);
          } else {
            tickFn();
          }
        }, time);
      };
      tickFn();
    });
  }

  const updateOrderStatus = async (status: ORDER_STATUS) => {
    if (!order) {
      return;
    }
    const newOrder = {
      ...order,
      status,
    };
    const index = orderList.findIndex((item) => item.value === order.value);
    const orders = orderList;
    orders[index] = newOrder;
    setOrder(newOrder);
    setOrderList(orders);
  };

  const poollingInfo = async () => {
    const data: ORDER_STATUS = await poolling({
      fn: getOrderInfo,
      time: 1000,
    });
    if (data === ORDER_STATUS.COMPLETE) {
      updateOrderStatus(ORDER_STATUS.COMPLETE);
    } else if (data === ORDER_STATUS.EXPIRE) {
      updateOrderStatus(ORDER_STATUS.EXPIRE);
    } else {
      return;
    }
  };

  async function orderData() {
    if (selectValue) {
      clearTimeout(getOrderTimeout);
      const selectOrder = orderList.find((item) => item.value === selectValue);
      if (!selectOrder) {
        const res = await vipPay(selectValue);
        const newOrder = {
          ...res,
          value: selectValue,
          expireDate: dayjs().add(40, "s"),
          status: ORDER_STATUS.CREATE,
        };
        const orders = orderList;
        orders.push(newOrder);
        setOrder(newOrder);
        setOrderList(orders);
        poollingInfo();
      } else {
        setOrder(selectOrder);
        poollingInfo();
      }
    }
  }

  useEffect(() => {
    if (isPayModalVisible) {
      orderData();
    }

    // const isMobile = isMobileScreen();
    // if (!isMobile) {

    // }
  }, [selectValue, isPayModalVisible]);

  // useEffect(() => {
  //   if (isMobile && verificationTimer) {
  //     clearTimeout(verificationTimer);
  //   }
  // }, [isMobile]);

  useEffect(() => {
    return getOrderTimeout && clearTimeout(getOrderTimeout);
  }, []);
  if (!isPayModalVisible) {
    return <div />;
  }

  return (
    <div className="modal-mask">
      <Modal
        title={"充值"}
        onClose={() => authStoreInfo.updatePayModalVisible(false)}
        // actions={
        //   isMobile
        //     ? [
        //         <IconButton
        //           key={"pay"}
        //           icon={<WeixinIcon />}
        //           className={styles["pay-submit-btn"]}
        //           text={"去支付"}
        //           onClick={() => {
        //             // navigate(Path.Records);
        //           }}
        //           bordered
        //           shadow
        //         />,
        //       ]
        //     : undefined
        // }
      >
        <div className={styles["pay-box"]}>
          <div className={styles["desc"]}>
            我们遵循 OpenAI API 的定价，并根据汇率和实际成本进行浮动
          </div>
          <div
            style={{
              display: "flex",
              height: "34px",
              lineHeight: "34px",
              margin: "8px",
            }}
          >
            当前价格：
            <ListType
              onTabClick={(state) => {
                setIsMode4(state);
              }}
              texts={[
                { name: "GPT-4", value: true },
                { name: "GPT-3.5", value: false },
              ]}
              status={isMode4}
            />
          </div>
          <div className={styles["desc"]}>0.015 积分 / 1000Token</div>
          <div className={styles["price-list"]}>
            {prices.map((item) => {
              return (
                <div
                  className={
                    selectValue === item
                      ? `${styles["price-box"]} ${styles["price-box-selected"]}`
                      : `${styles["price-box"]}`
                  }
                  key={item}
                  onClick={() => {
                    setSelectValue(item);
                  }}
                >
                  <label>
                    <div className={styles["price"]}>¥ {item}</div>
                    <div className={styles["text"]}>
                      约合聊 34,000 ~ 50,000 字
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
          <div className={styles["desc"]}>
            1 积分=￥1 长连续对话会增加费用，请注意开销。
          </div>
          {/* {!isMobile && ( */}
          {order && order.status === ORDER_STATUS.COMPLETE ? (
            <IconButton
              text={"去发送消息试试吧"}
              className={styles["chat-input-send"]}
              type="primary"
              onClick={() => {
                navigate(Path.Chat);
              }}
            />
          ) : (
            <div className={styles["qrcode-box"]}>
              {order && order.status === ORDER_STATUS.EXPIRE && (
                <div className={styles["qrcode-invalid"]}>
                  <div>二维码失效</div>
                  <div>请点击刷新</div>
                </div>
              )}
              {order && order.status === ORDER_STATUS.CREATE && (
                <QRCode
                  id="pay_code_url"
                  value={"https://baidu.com"}
                  size={120}
                  style={{ padding: 15 }}
                />
              )}
              <div className={styles["pay-weixin"]}>
                <div className={styles["pay-weixin-icon"]}>
                  <WeixinIcon />
                </div>
                &nbsp;微信扫码支付
              </div>
            </div>
          )}
          {/* )} */}
        </div>
      </Modal>
    </div>
  );
}
