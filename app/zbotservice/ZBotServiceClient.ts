import HttpClient from "./HttpClient";
import { getServerSideConfig } from "../config/server";

export class UserInfoVO {
  email!: string;
  nickName!: string;
  occupation!: string;
  inviterEmail!: string;
}

export type UserLoginVO = {
  email: string;
  verifyCode: number;
};

export type UserSecretVO = {
  email: string;
  password: string;
  verifyCode: number;
};

export type UserRegisterVO = {
  email: string;
  verifyCode: number;
  nickName: string;
  occupation: string;
  inviterEmail: string;
};

export enum UserCheckResultVO {
  success,
  successNew,
  notFound,
  emailConflict,
  emailInvalid,
  emailSendFail,
  verifyCodeInvalid,
  coinOut,
  Signined,
}

// 非空断言运算符 ! 来告诉 TypeScript，该属性会在其他地方被初始化，不需要在构造函数中赋值
export class UserRequestInfoVO {
  email!: string;
  baseCoins!: number;
  thisDayCoins!: number;
  totalSigninDays!: number;
  totalRequests!: number;
  isThisDaySignin!: boolean;
}

export class UserConstantVO {
  maxCodeValidMinutes!: number;
  firstBaseCoins!: number;
  dayBaseCoins!: number;
  dayLimitCoins!: number;
  inviteBaseCoins!: number;
}

export type UserRequestResponseVO = {
  status: UserCheckResultVO;
  userHasCoins: boolean;
};

export class UserFeedbackVO {
  email: string = "";
  title: string = "";
  description: string = "";
  phone: string = "";
}

// put here for use convenience
export enum LocalStorageKeys {
  userEmail = "userEmail",
  zBotServiceUrl = "zBotServiceUrl",
}

class ZBotServiceClient {
  client: HttpClient;

  constructor(silent = false) {
    const serviceAddress = getServerSideConfig().zBotServiceUrl;
    this.client = new HttpClient({}, serviceAddress as string);
  }

  getHealth() {
    return this.client.get<boolean>(`/health/get`, {});
  }

  async getHealthAsync() {
    return await this.client.get<boolean>(`/health/get`, {});
  }

  getUserInfo(email: string) {
    return this.client.get<UserInfoVO>(`/userInfo/${email}`, {});
  }

  getRequestInfo(email: string) {
    return this.client.get<UserRequestInfoVO>(
      `/userInfo/${email}/requestInfo`,
      {},
    );
  }

  getConstant() {
    return this.client.get<UserConstantVO>(`/userInfo/constant`, {});
  }

  login(userLoginVO: UserLoginVO) {
    return this.client.post<UserCheckResultVO>(`/userInfo/login`, userLoginVO);
  }

  register(userRegisterVO: UserRegisterVO) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/register`,
      userRegisterVO,
    );
  }

  updateInfo(userInfoVO: UserInfoVO) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/updateInfo`,
      userInfoVO,
    );
  }

  sendFeedback(feedbackVO: UserFeedbackVO) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/feedback`,
      feedbackVO,
    );
  }

  updateRequest(email: string) {
    return this.client.post<UserRequestResponseVO>(
      `/userInfo/${email}/updateRequest`,
      {},
    );
  }

  sendVerifyCode(email: string) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/${email}/verifyCode`,
      email,
    );
  }

  signin(email: string) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/${email}/signin`,
      email,
    );
  }
}

const zBotServiceClient = new ZBotServiceClient();
export default zBotServiceClient;
