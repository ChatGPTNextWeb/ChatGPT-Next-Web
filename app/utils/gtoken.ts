/**
 * npm:gtoken patched version for nextjs edge runtime, by ryanhex53
 */
// import { default as axios } from "axios";
import { SignJWT, importPKCS8 } from "jose";

const GOOGLE_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";
const GOOGLE_REVOKE_TOKEN_URL =
  "https://accounts.google.com/o/oauth2/revoke?token=";

export type GetTokenCallback = (err: Error | null, token?: TokenData) => void;

export interface Credentials {
  privateKey: string;
  clientEmail?: string;
}

export interface TokenData {
  refresh_token?: string;
  expires_in?: number;
  access_token?: string;
  token_type?: string;
  id_token?: string;
}

export interface TokenOptions {
  key: string;
  email?: string;
  iss?: string;
  sub?: string;
  scope?: string | string[];
  additionalClaims?: Record<string | number | symbol, never>;
  // Eagerly refresh unexpired tokens when they are within this many
  // milliseconds from expiring".
  // Defaults to 5 minutes (300,000 milliseconds).
  eagerRefreshThresholdMillis?: number;
}

export interface GetTokenOptions {
  forceRefresh?: boolean;
}

class ErrorWithCode extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
  }
}

export class GoogleToken {
  get accessToken() {
    return this.rawToken ? this.rawToken.access_token : undefined;
  }
  get idToken() {
    return this.rawToken ? this.rawToken.id_token : undefined;
  }
  get tokenType() {
    return this.rawToken ? this.rawToken.token_type : undefined;
  }
  get refreshToken() {
    return this.rawToken ? this.rawToken.refresh_token : undefined;
  }
  expiresAt?: number;
  key: string = "";
  iss?: string;
  sub?: string;
  scope?: string;
  rawToken?: TokenData;
  tokenExpires?: number;
  email?: string;
  additionalClaims?: Record<string | number | symbol, never>;
  eagerRefreshThresholdMillis: number = 0;

  #inFlightRequest?: undefined | Promise<TokenData | undefined>;

  /**
   * Create a GoogleToken.
   *
   * @param options  Configuration object.
   */
  constructor(options?: TokenOptions) {
    this.#configure(options);
  }

  /**
   * Returns whether the token has expired.
   *
   * @return true if the token has expired, false otherwise.
   */
  hasExpired() {
    const now = new Date().getTime();
    if (this.rawToken && this.expiresAt) {
      return now >= this.expiresAt;
    } else {
      return true;
    }
  }

  /**
   * Returns whether the token will expire within eagerRefreshThresholdMillis
   *
   * @return true if the token will be expired within eagerRefreshThresholdMillis, false otherwise.
   */
  isTokenExpiring() {
    const now = new Date().getTime();
    const eagerRefreshThresholdMillis = this.eagerRefreshThresholdMillis ?? 0;
    if (this.rawToken && this.expiresAt) {
      return this.expiresAt <= now + eagerRefreshThresholdMillis;
    } else {
      return true;
    }
  }

  /**
   * Returns a cached token or retrieves a new one from Google.
   *
   * @param callback The callback function.
   */
  getToken(opts?: GetTokenOptions): Promise<TokenData | undefined>;
  getToken(callback: GetTokenCallback, opts?: GetTokenOptions): void;
  getToken(
    callback?: GetTokenCallback | GetTokenOptions,
    opts = {} as GetTokenOptions,
  ): void | Promise<TokenData | undefined> {
    if (typeof callback === "object") {
      opts = callback as GetTokenOptions;
      callback = undefined;
    }
    opts = Object.assign(
      {
        forceRefresh: false,
      },
      opts,
    );

    if (callback) {
      const cb = callback as GetTokenCallback;
      this.#getTokenAsync(opts).then((t) => cb(null, t), callback);
      return;
    }

    return this.#getTokenAsync(opts);
  }

  async #getTokenAsync(opts: GetTokenOptions): Promise<TokenData | undefined> {
    if (this.#inFlightRequest && !opts.forceRefresh) {
      return this.#inFlightRequest;
    }

    try {
      return await (this.#inFlightRequest = this.#getTokenAsyncInner(opts));
    } finally {
      this.#inFlightRequest = undefined;
    }
  }

  async #getTokenAsyncInner(
    opts: GetTokenOptions,
  ): Promise<TokenData | undefined> {
    if (this.isTokenExpiring() === false && opts.forceRefresh === false) {
      return Promise.resolve(this.rawToken!);
    }
    if (!this.key) {
      throw new Error("No key or keyFile set.");
    }
    if (!this.iss) {
      throw new ErrorWithCode("email is required.", "MISSING_CREDENTIALS");
    }
    const token = await this.#requestToken();
    return token;
  }

  /**
   * Revoke the token if one is set.
   *
   * @param callback The callback function.
   */
  revokeToken(): Promise<void>;
  revokeToken(callback: (err?: Error) => void): void;
  revokeToken(callback?: (err?: Error) => void): void | Promise<void> {
    if (callback) {
      this.#revokeTokenAsync().then(() => callback(), callback);
      return;
    }
    return this.#revokeTokenAsync();
  }

  async #revokeTokenAsync() {
    if (!this.accessToken) {
      throw new Error("No token to revoke.");
    }
    const url = GOOGLE_REVOKE_TOKEN_URL + this.accessToken;
    // await axios.get(url, { timeout: 10000 });
    // uncomment below if prefer using fetch, but fetch will not follow HTTPS_PROXY
    await fetch(url, { method: "GET" });

    this.#configure({
      email: this.iss,
      sub: this.sub,
      key: this.key,
      scope: this.scope,
      additionalClaims: this.additionalClaims,
    });
  }

  /**
   * Configure the GoogleToken for re-use.
   * @param  {object} options Configuration object.
   */
  #configure(options: TokenOptions = { key: "" }) {
    this.key = options.key;
    this.rawToken = undefined;
    this.iss = options.email || options.iss;
    this.sub = options.sub;
    this.additionalClaims = options.additionalClaims;
    if (typeof options.scope === "object") {
      this.scope = options.scope.join(" ");
    } else {
      this.scope = options.scope;
    }
    this.eagerRefreshThresholdMillis =
      options.eagerRefreshThresholdMillis || 5 * 60 * 1000;
  }

  /**
   * Request the token from Google.
   */
  async #requestToken(): Promise<TokenData | undefined> {
    const iat = Math.floor(new Date().getTime() / 1000);
    const additionalClaims = this.additionalClaims || {};
    const payload = Object.assign(
      {
        iss: this.iss,
        scope: this.scope,
        aud: GOOGLE_TOKEN_URL,
        exp: iat + 3600,
        iat,
        sub: this.sub,
      },
      additionalClaims,
    );
    const privateKey = await importPKCS8(this.key, "RS256");
    const signedJWT = await new SignJWT(payload)
      .setProtectedHeader({ alg: "RS256" })
      .sign(privateKey);
    const body = new URLSearchParams();
    body.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
    body.append("assertion", signedJWT);
    try {
      // const res = await axios.post<TokenData>(GOOGLE_TOKEN_URL, body, {
      //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //   timeout: 15000,
      //   validateStatus: (status) => {
      //     return status >= 200 && status < 300;
      //   },
      // });
      // this.rawToken = res.data;

      // uncomment below if prefer using fetch, but fetch will not follow HTTPS_PROXY
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      this.rawToken = (await res.json()) as TokenData;

      this.expiresAt =
        this.rawToken.expires_in === null ||
        this.rawToken.expires_in === undefined
          ? undefined
          : (iat + this.rawToken.expires_in!) * 1000;
      return this.rawToken;
    } catch (e) {
      this.rawToken = undefined;
      this.tokenExpires = undefined;
      if (e instanceof Error) {
        throw Error("failed to get token: " + e.message);
      } else {
        throw Error("failed to get token: " + String(e));
      }
    }
  }
}
