import "@/app/app/login.scss";
import { Metadata } from "next";
import { ReactNode } from "react";
import { VerifiedUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | 实人认证",
};

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const isUser = await VerifiedUser();
  if (isUser) {
    // Replace '/dashboard' with the desired redirect path
    redirect("/");
  }

  return (
    <div className="container1 w-full signin">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
