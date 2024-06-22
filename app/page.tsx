"use client";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { useEffect } from "react";
import { useAccessStore } from "./store";
import { Path } from "./constant";
import { useRouter } from "next/navigation";
import { useTokenRefresh } from "./utils/hooks";
const serverConfig = getServerSideConfig();

export default function App() {
  const router = useRouter();
  const isLoggedin = useAccessStore.getState().isLoggedin;

  useEffect(() => {
    if (!isLoggedin) {
      if (process.env.NODE_ENV === "development") {
        router.push(Path.LoginDev);
      } else {
        router.push(Path.Login);
      }
    }
  }, [isLoggedin, router]);

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
