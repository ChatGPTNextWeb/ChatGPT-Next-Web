"use client";
// app\auth\login.tsx
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, type ResourcesConfig } from "aws-amplify";
import { Hub } from "aws-amplify/utils";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Path } from "../constant";
import styles from "./login.module.scss";
import "@aws-amplify/ui-react/styles.css";
import {
  confirmSignIn,
  type ConfirmSignInInput,
  type ConfirmSignInOutput,
} from "aws-amplify/auth";

const authConfig: ResourcesConfig["Auth"] = {
  Cognito: {
    userPoolId: "eu-central-1_vu74Tv7SY",
    userPoolClientId: "6f4c2hie09ms17uvmo2qn1kmkh",
  },
};

Amplify.configure({
  Auth: authConfig,
});

export function Login() {
  // const services = {
  //   async handleConfirmSignIn(
  //     input: ConfirmSignInInput,
  //   ): Promise<ConfirmSignInOutput> {
  //     try {
  //       console.log("Confirming sign in", input);
  //       const result = await confirmSignIn(input);
  //       console.log("Sign in confirmed", result);
  //       router.push(Path.Home);
  //       return result;
  //     } catch (error) {
  //       console.error("Error confirming sign in", error);
  //       throw error; // Ensure to throw the error to match the expected return type
  //     }
  //   },
  // };
  const router = useRouter();
  // 监听事件
  useEffect(() => {
    Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          console.log("user have been signedIn successfully.");
          router.push(Path.Home);
          break;
        case "signedOut":
          console.log("user have been signedOut successfully.");
          break;
        case "tokenRefresh":
          console.log("auth tokens have been refreshed.");
          break;
        case "tokenRefresh_failure":
          console.log("failure while refreshing auth tokens.");
          break;
        case "signInWithRedirect":
          console.log("signInWithRedirect API has successfully been resolved.");
          break;
        case "signInWithRedirect_failure":
          console.log(
            "failure while trying to resolve signInWithRedirect API.",
          );
          break;
        case "customOAuthState":
          console.info("custom state returned from CognitoHosted UI");
          break;
      }
    });
  }, []);

  return (
    <div className={styles.loginContainer}>
      <Authenticator
        loginMechanisms={["email"]}
        socialProviders={["apple", "google"]}
        signUpAttributes={["name"]}
        //services={services}
        //variation="modal"
        className={styles.authenticator}
      ></Authenticator>
    </div>
  );
}
