import { showToast } from "../components/ui-lib";

import LeftIcon from "../icons/left.svg";
import CloseIcon from "../icons/close.svg";
import { IconButton } from "../components/button";
import { Path } from "../constant";
import { NavigateFunction } from "react-router";

import zBotServiceClient, {
  UserCheckResultVO,
} from "../zbotservice/ZBotServiceClient";

export async function sendVerifyCode(userEmail: string) {
  console.log("userEmail: ", userEmail);

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

export function UserInfoWindowHeader(
  navigate: NavigateFunction,
  title: string,
) {
  return (
    <div className="window-header">
      <div className="window-header-title">
        <div className="window-header-main-title">{title}</div>
      </div>
      <div className="window-actions">
        <div className="window-action-button">
          <IconButton
            icon={<LeftIcon />}
            onClick={() => navigate(Path.Settings)}
            bordered
            title="返回"
          ></IconButton>
        </div>
        <div className="window-action-button">
          <IconButton
            icon={<CloseIcon />}
            onClick={() => navigate(Path.Home)}
            bordered
            title={"关闭"}
          />
        </div>
      </div>
    </div>
  );
}
