import { showToast } from "../components/ui-lib";

import zBotServiceClient, {
  UserCheckResultVO,
} from "../zbotservice/ZBotServiceClient";

export async function sendVerifyCode(userEmail: string) {
  if (userEmail.trim().length === 0) {
    showToast("邮箱不可为空, 请重新输入");
    return;
  }

  // register to db
  try {
    console.log(`sendVerifyCode to:`, userEmail);

    let result = await zBotServiceClient.sendVerifyCode(userEmail);
    console.log(`sendVerifyCode result: `, result);

    if (result === UserCheckResultVO.success) {
      showToast("验证码已发送至邮箱, 请查收");
    } else if (result === UserCheckResultVO.emailInvalid) {
      showToast("该邮箱格式不正确, 请重新输入");
    } else {
      showToast("验证码发送失败, 请重新发送");
    }
  } catch (error) {
    console.log("db access failed:", error);
  }
}
