import cookies from "js-cookie";

const TOKEN_COOKIE_NAME = "auth_token";
const TOKEN_TIMESTAMP_COOKIE_NAME = "auth_token_timestamp";

export const setToken = (token: string) => {
  cookies.set(TOKEN_COOKIE_NAME, token, { expires: 7 });
  cookies.set(TOKEN_TIMESTAMP_COOKIE_NAME, Date.now().toString(), {
    expires: 7,
  });
};
export const getToken = () => {
  return String(cookies.get(TOKEN_COOKIE_NAME));
};

export const getTokenTimeStamp = () => {
  const timestamp = cookies.get(TOKEN_TIMESTAMP_COOKIE_NAME);
  return timestamp ? parseInt(timestamp, 10) : null;
};

export const isTokenExpired = () => {
  const timestamp = getTokenTimeStamp();
  if (!timestamp) return true;

  const now = Date.now();
  const diff = now - timestamp;
  const hoursPassed = diff / (1000 * 60 * 60);
  return hoursPassed > 24;
};
