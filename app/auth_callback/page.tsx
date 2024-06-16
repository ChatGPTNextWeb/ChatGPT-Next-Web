"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccessStore } from "@/app/store";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      // Update the state with the token and isLoggedin to true
      useAccessStore.setState({ openaiApiKey: `${token}`, isLoggedin: true });

      console.log("User is logged in:", useAccessStore.getState().isLoggedin);

      // Redirect to the home page
      router.push("/");
    }
  }, [token, router]);

  // Don't render anything, just redirect
  return null;
};

export default AuthCallbackPage;
