"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { IconButton } from "../components/button";

import styles from "./login.module.scss";

export default function Login() {
  const session = useSession();

  const handleLogin = async () => {
    signIn("azure-ad", {
      callbackUrl: "/",
    });
  };

  return (
    <div className={styles["container"]}>
      <h1 className={styles["headline"]}>Welcome to AdEx GPT</h1>

      <p className={styles["subline"]}>
        Before you can start using AdEx GPT you have to sign in using your AdEx
        account. After a successful sign in you will be redirected to the chat.
      </p>

      {session.status === "authenticated" ? (
        <Link href="/" className={styles["sign-in-button"]}>
          <IconButton
            text="Go to Chat"
            type="primary"
            className={styles["sign-in-button"]}
          />
        </Link>
      ) : (
        <IconButton
          text="Login"
          type="primary"
          className={styles["sign-in-button"]}
          onClick={handleLogin}
        />
      )}
    </div>
  );
}
