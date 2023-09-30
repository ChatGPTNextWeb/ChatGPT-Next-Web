import { signIn, signOut, useSession } from "next-auth/react";
import { Home } from "../app/components/home";
import Locale from "../app/locales";

import "../app/styles/globals.scss";
import "../app/styles/markdown.scss";
import "../app/styles/highlight.scss";
import styles from "../app/components/auth.module.scss";
import Image from "next/image";
import Head from "next/head";

export default function Chat() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <>Loading...</>;
  }

  if (session) {
    return (
      <>
        <Head>
          <title>AILA ChatGPT</title>
        </Head>
        <Home />
      </>
    );
  }
  return (
    <>
      <Head>
        <title>AILA ChatGPT</title>
      </Head>
      <style jsx>{`
        button {
          background-color: white;
          border: 1px solid #eaeaea;
          font-size: 1.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
          hover: {
          }
        }

        button:hover {
          background-color: #eaeaea;
          transition: 0.7s;
          cursor: pointer;
        }
      `}</style>
      <div className={styles["auth-page"]}>
        <div className={`no-dark ${styles["auth-logo"]}`}>
          <Image src="/aila-logo-round@2x.png" width="48" height="48" />
          <p>&nbsp;</p>
        </div>
        <div className={styles["auth-title"]}>{Locale.Home.LoginMessage}</div>
        <div className={styles["auth-actions"]}>
          <p>&nbsp;</p>
          <button onClick={() => signIn("okta")}>{Locale.Home.Login}</button>
        </div>
      </div>
    </>
  );
}
