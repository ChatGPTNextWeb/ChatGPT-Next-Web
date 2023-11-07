"use client";

import { signIn } from "next-auth/react";

export default function Login() {
  const handleLogin = async () => {
    signIn("azure-ad", {
      callbackUrl: "/",
    });
  };

  return (
    <div>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
