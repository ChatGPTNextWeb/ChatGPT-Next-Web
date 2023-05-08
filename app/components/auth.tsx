import { Button } from "./button";
import styles from "./auth.module.scss";
import { Modal, showToast } from "./ui-lib";
import { useEffect, useState } from "react";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { AuthenticationClient } from "authing-js-sdk";
import { trimPhoneNumberOrText, validatePhoneFormat } from "../utils";
import { AuthStore, authStore } from "../store/auth";
const authenticationClient = new AuthenticationClient({
  appId: "64488f3c269681acaa583a71",
  appHost: "https://haogpt.authing.cn",
});
let timer: any;
export function AuthModal() {
  const authStoreInfo: any = authStore();
  const [time, setTime] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const onPhoneChange = (e: { target: { value: string } }) => {
    const phone = e.target.value;
    setPhone(trimPhoneNumberOrText(phone));
  };

  const onVerificationCodeChange = (e: { target: { value: string } }) => {
    const code = e.target.value;
    setCode(trimPhoneNumberOrText(code));
  };

  const requestVerificationCode = async () => {
    console.log(1111111, phone, time);
    if (!validatePhoneFormat(phone)) {
      showToast("请输入正确的手机号");
      return;
    }
    if (time !== 0) {
      return;
    }
    try {
      //   setIsLoading(true);
      await authenticationClient.sendSmsCode(phone);
      //   setIsLoading(false);
      showToast("我们已将验证码发送到您的手机，请留意短信");
      setTime(60);
    } catch (e) {
      showToast("发送验证码失败，请稍后重试");
    }
  };

  useEffect(() => {
    if (time === 60)
      timer = setInterval(() => setTime((time) => time - 1), 1000);
    else if (time === 0) {
      clearInterval(timer);
    }
  });

  useEffect(() => {
    return () => timer && clearInterval(timer);
  }, []);
  if (!authStoreInfo.isAuthModalVisible) {
    return <div />;
  }

  return (
    <div className="modal-mask">
      <Modal
        title={"登录"}
        onClose={() => authStoreInfo.updateAuthModalVisible(false)}
        actions={[
          <Button
            key="submit"
            className={styles["authing-guard-form-submit-btn"]}
            onClick={() => authenticationClient.loginByPhoneCode(phone, code)}
            bordered
            text={"确定"}
          />,
        ]}
      >
        <div className={styles["authing-box"]}>
          <div
            className={`${styles["authing-ant-row"]} ${styles["authing-ant-form-item"]}`}
          >
            <input
              className={styles["authing-ant-form-item-control-input"]}
              maxLength={11}
              onChange={(e) => onPhoneChange(e)}
              placeholder="请输入手机号码"
            />
          </div>
          <div
            className={`${styles["authing-ant-row"]} ${styles["authing-ant-form-item"]}`}
          >
            <input
              className={`${styles["authing-ant-form-item-control-input"]} ${styles["isExited"]}`}
              placeholder="请输入验证码"
              onChange={(e) => onVerificationCodeChange(e)}
            />
            <Button
              onClick={requestVerificationCode}
              className={styles["verify-btn"]}
              bordered
              text={time > 0 && time < 61 ? `${time} S` : "获取验证码"}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
