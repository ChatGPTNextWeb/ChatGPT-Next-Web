import LocalStorage from "./storage";

const localStorage = new LocalStorage("chat-auth");

class AuthManager {
  static TOKEN_KEY = "token";

  private _token!: string | null;

  constructor() {
    const token = localStorage.getItem(AuthManager.TOKEN_KEY);
    if (token) {
      this.setToken(token);
    }
  }

  /**
   * 设定鉴权token
   *
   * @param {string} [token]
   * @returns {boolean}
   * @memberof AuthClient
   */
  setToken(token: string) {
    this._token = token;
    localStorage.setItem(AuthManager.TOKEN_KEY, token);
    return this._token;
  }

  /**
   * 获得鉴权token
   *
   * @returns {(string | null)}
   * @memberof AuthClient
   */
  getToken(): string | null {
    return this._token;
  }

  /**
   * 是否已经鉴权
   *
   * @returns {boolean}
   */
  isAuthenticated(): boolean {
    return !!this._token;
  }

  /**
   * 清除鉴权token
   *
   * @memberof AuthClient
   */
  invalidate() {
    this._token = null;
    localStorage.removeItem(AuthManager.TOKEN_KEY);
  }
}

const authManager = new AuthManager();

export default authManager;
