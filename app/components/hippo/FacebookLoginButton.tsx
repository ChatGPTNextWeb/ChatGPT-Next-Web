// components/FacebookLoginButton.js

import { useEffect } from "react";
import { loadFacebookSDK } from "./facebookSDK";

export default function FacebookLoginButton() {
  useEffect(() => {
    loadFacebookSDK();
  }, []);

  function facebookLogin() {
    FB.login(
      function (response) {
        if (response.authResponse) {
          // User logged in successfully, handle the login response
          console.log("User is now logged in");
          console.log(response);
        } else {
          // User canceled login or did not authorize
          console.log("User canceled login or did not authorize.");
        }
      },
      { scope: "email" },
    ); // Specify the required permissions
  }

  return (
    <button id="fb-login-button" onClick={facebookLogin}>
      Đăng nhập bằng Facebook
    </button>
  );
}
