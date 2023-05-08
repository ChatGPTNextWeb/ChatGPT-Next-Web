import { Button, IconButton } from "./button";
import styles from "./pay.module.scss";
import { Modal } from "./ui-lib";
import { useEffect, useState } from "react";
import WeixinIcon from "../icons/weixin.svg";
import { ListType } from "./records";
import QRCode from "qrcode.react";
import { isMobileScreen } from "../utils";
let verificationTimer: any;
export function PayModal() {
  const [prices, setPrices] = useState<number[]>([]);
  const [selectValue, setSelectValue] = useState<number>(1);
  const [isMode4, setIsMode4] = useState<boolean>(true);
  const [verification, setVerification] = useState<string>();
  const isMobile = isMobileScreen();
  useEffect(() => {
    setPrices(isMode4 ? [5, 6, 7] : [1, 2, 3]);
    setSelectValue(isMode4 ? 5 : 1);
  }, [isMode4]);

  useEffect(() => {
    const isMobile = isMobileScreen();
    if (!isMobile) {
      clearTimeout(verificationTimer);
      verificationTimer = setTimeout(() => {
        setVerification("invalid");
      }, 3000);
    }
  }, [selectValue]);

  useEffect(() => {
    if (isMobile && verificationTimer) {
      clearTimeout(verificationTimer);
    }
  }, [isMobile]);

  useEffect(() => {
    return verificationTimer && clearTimeout(verificationTimer);
  }, []);

  return (
    <div className="modal-mask">
      <Modal
        title={"充值"}
        //   onClose={() => props.onClose?.()}
        actions={
          isMobile
            ? [
                // <Button
                //   key="submit"
                //   className={styles["authing-guard-form-submit-btn"]}
                //   onClick={() => {
                //     //
                //   }}
                //   bordered
                //   text={"去支付"}
                // />,
                <IconButton
                  key={"pay"}
                  icon={<WeixinIcon />}
                  className={styles["pay-submit-btn"]}
                  text={"去支付"}
                  onClick={() => {
                    // navigate(Path.Records);
                  }}
                  bordered
                  shadow
                />,
              ]
            : undefined
        }
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
          {!isMobile && (
            <div className={styles["qrcode-box"]}>
              {verification ? (
                <div className={styles["qrcode-invalid"]}>
                  <div>二维码失效</div>
                  <div>请点击刷新</div>
                </div>
              ) : (
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
        </div>
      </Modal>
    </div>
  );
}
