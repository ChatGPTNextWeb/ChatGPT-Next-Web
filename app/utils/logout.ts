import { Path } from "../constant";
import { useAccessStore } from "../store";

export default function Logout() {
  useAccessStore.setState({ isLoggedin: false, openaiApiKey: "" });

  if (process.env.NODE_ENV === "development") {
    navigateToExternalSite(Path.LoginDev);
  } else {
    navigateToExternalSite(Path.Login);
  }
}

export const navigateToExternalSite = (url: string) => {
  window.location.href = url;
};
