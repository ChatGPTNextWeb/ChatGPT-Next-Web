import "@/app/app/login.scss";
import { Metadata } from "next";
import { ReactNode } from "react";
// import { useEffect } from "react";
// import {useSession} from "next-auth/react";
import { getSession } from "@/lib/auth";
import { isName } from "@/lib/auth_list";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Login | 实人认证",
};

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  // If the user is already authenticated, redirect them to home
  if (session?.user?.name && isName(session.user.name)) {
    // Replace '/dashboard' with the desired redirect path
    redirect("/");
  }

  return (
    <div className="container mx-auto signin">
      <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
