"use client";

import { signIn, useSession } from "next-auth/react";

import { useEffect } from "react";
import { Loading } from "../components/home";

export default function Login() {
  const session = useSession();

  useEffect(() => {
    const handleLogin = async () => {
      signIn("azure-ad", {
        callbackUrl: "/",
      });
    };

    handleLogin();
  }, []);

  return <Loading />;
}
