import HttpClient from "./HttpClient";

export type UserInfoVO = {
  email: string;
  nickName: string;
  occupation: string;
  inviter: string;
};

export type UserLoginVO = {
  email: string;
  password: string;
};

export type UserSecretVO = {
  email: string;
  password: string;
  verifyCode: number;
};

export type UserRegisterVO = {
  email: string;
  password: string;
  nickName: string;
  occupation: string;
  inviterEmail: string;
  verifyCode: number;
};

export enum UserCheckResultVO {
  success = 0,
  notFound = 1,
  passwordError = 2,
  emailConflict = 3,
  emailInvalid = 4,
  emailSendFail = 5,
  verifyCodeInvalid = 6,
}

export interface UserResponseVO {
  // TODO: 大写 会存在取不到属性值的情况...
  result: UserCheckResultVO;
  message: string;
}

class ZBotServiceClient {
  client: HttpClient;

  constructor(silent = false) {
    this.client = new HttpClient({}, silent);
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

  updateSecret(userLoginVO: UserLoginVO) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/updateSecret`,
      userLoginVO,
    );
  }

  updateRequest(email: string) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/updateRequest/${email}`,
      {},
    );
  }

  sendVerifyCode(email: string) {
    return this.client.post<UserCheckResultVO>(
      `/userInfo/verifyCode/${email}`,
      email,
    );
  }
}

// put here for use convenience
export const userLocalStorage = (() => {
  const UserEmailKey = "UserEmailKey";

  const set = (userEmail: string) => {
    localStorage.setItem(UserEmailKey, userEmail);
  };

  const get = () => {
    return localStorage.getItem(UserEmailKey);
  };

  const remove = () => {
    localStorage.removeItem(UserEmailKey);
  };

  return {
    set,
    get,
    remove,
  };
})();

const zBotServiceClient = new ZBotServiceClient();
export default zBotServiceClient;
