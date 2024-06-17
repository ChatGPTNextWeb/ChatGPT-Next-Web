"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccessStore } from "@/app/store";
import { Loading } from "../components/ui-lib";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  console.log(token);

  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      // Update the state with the token and isLoggedin to true
      useAccessStore.setState({ openaiApiKey: `${token}`, isLoggedin: true });

      router.push("/");
    }
  }, [token, router]);

  return null;
};
const AuthCallbackPageWrapper = () => {
  return (
    <Suspense>
      fallback=
      {<Loading />}
      <AuthCallbackPage />
    </Suspense>
  );
};

export default AuthCallbackPageWrapper;
