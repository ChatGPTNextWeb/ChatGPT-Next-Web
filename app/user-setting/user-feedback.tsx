import styles from "../components/settings.module.scss";
import { IconButton } from "../components/button";
import { AppInfo } from "../constant";

import { Input, showToast, showModal } from "../components/ui-lib";

import zBotServiceClient, {
  UserCheckResultVO,
  LocalStorageKeys,
  UserFeedbackVO,
  UserConstantVO,
} from "../zbotservice/ZBotServiceClient";

export function about(userConstantVO: UserConstantVO) {
  const mdText = `
    欢迎来到${AppInfo.Title}！

    ${AppInfo.Title}提供了与ChatGPT进行对话的能力。您可以随时随地与我们的AI助手展开对话。

    我们非常重视用户隐私和数据安全。在使用${AppInfo.Title}时，我们不会后台存储或分析用户的聊天记录。所有的聊天记录都直接转发到OpenAI，这意味着您的对话数据将由OpenAI进行处理和存储。
    作为一家技术领先的公司，OpenAI采取了严格的数据保护措施，以确保您的数据安全和隐私保护。

    我们采用AI币聊天方式, AI币 = 基础AI币 + 限时AI币 
      - 1). 新用户注册, 赠送: ${userConstantVO.firstBaseCoins}个基础币
      - 2). 每日签到，赠送: ${userConstantVO.dayBaseCoins}个基础币 + ${userConstantVO.dayLimitCoins}个限时币
      - 3). 邀请用户, 邀请人和被邀请人均赠送: ${userConstantVO.inviteBaseCoins}个基础币 
      - 4). 基础币不会清空, 限时币每日0点清空
      - 5). 每条消息消耗1个AI币

    祝畅聊愉快。
    `;

  showModal({
    title: AppInfo.Title,
    children: (
      <div className="markdown-body">
        <pre className={styles["export-content"]}>{mdText}</pre>
      </div>
    ),
  });
}

const submit = async (feedbackVO: UserFeedbackVO) => {
  console.log("feedbackVO: ", feedbackVO);

  if (feedbackVO.email === null || feedbackVO.email.trim().length === 0) {
    showToast("用户尚未登录, 请先登录");
    return;
  } else if (feedbackVO.title.trim().length === 0) {
    showToast("Title不可为空");
    return;
  } else if (feedbackVO.description.trim().length === 0) {
    showToast("description不可为空");
    return;
  }

  try {
    const result = await zBotServiceClient.sendFeedback(feedbackVO);
    if (result === UserCheckResultVO.success) {
      showToast("反馈已提交, 请返回");
    } else if (result === UserCheckResultVO.notFound) {
      showToast("邮箱尚未注册, 请先注册");
    } else {
      showToast("反馈提交失败, 请重新提交");
    }
  } catch (error) {
    console.log("db access failed:"), error;
  }
};

export function feedback() {
  // useState: Invalid hook call, Hooks can only be called inside of the body of a function component
  // so we use class to save temp data
  let feedbackVO = new UserFeedbackVO();
  feedbackVO.email = localStorage.getItem(LocalStorageKeys.userEmail) as string;

  showModal({
    title: AppInfo.Title + "-反馈",
    children: (
      <div className={styles["edit-prompt-modal"]}>
        <input
          type="text"
          placeholder="标题"
          className={styles["edit-prompt-title"]}
          onChange={(e) => {
            feedbackVO.title = e.target.value;
          }}
        ></input>
        <Input
          placeholder="详细描述"
          rows={10}
          className={styles["edit-prompt-content"]}
          onChange={(e) => {
            feedbackVO.description = e.currentTarget.value;
          }}
        ></Input>
      </div>
    ),
    actions: [
      <IconButton
        bordered
        key=""
        text="提交"
        onClick={() => submit(feedbackVO)}
      />,
    ],
  });
}
