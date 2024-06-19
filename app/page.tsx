"use client";
import { Analytics } from "@vercel/analytics/react";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";
import { useEffect } from "react";
import { useAccessStore } from "./store";
import { Path } from "./constant";
import { useRouter } from "next/navigation";
const serverConfig = getServerSideConfig();

export default async function App() {
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
  }, []);
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
