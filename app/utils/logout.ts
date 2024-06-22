import { Path } from "../constant";
import { useAccessStore } from "../store";
import { clearToken } from "./tokenManager";

export default function Logout() {
  useAccessStore.setState({ isLoggedin: false, openaiApiKey: "" });
  clearToken();

  if (process.env.NODE_ENV === "development") {
    navigateToExternalSite(Path.LoginDev);
  } else {
    navigateToExternalSite(Path.Login);
  }
}

export const navigateToExternalSite = (url: string) => {
  window.location.href = url;
};
