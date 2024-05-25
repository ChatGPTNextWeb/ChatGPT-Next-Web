import "@/app/app/login.scss";
import { Metadata } from "next";
import { ReactNode } from "react";
import Image from "next/image";
// import { VerifiedUser } from "@/lib/auth";
// import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | 实人认证",
};

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  // const isUser = await VerifiedUser();
  // if (isUser) {
  //   // Replace '/dashboard' with the desired redirect path
  //   redirect("/");
  // }

  return (
    <div className="container1 w-full signin">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="login-form border border-stone-200 py-10 dark:border-stone-700 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md ">
          <Image
            alt="Platforms Starter Kit"
            width={100}
            height={100}
            className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
            src="https://oss.xiaosi.cc/chat/public/android-chrome-512x512.png"
          />
          <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-500">
            Sign in to your account
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
}
