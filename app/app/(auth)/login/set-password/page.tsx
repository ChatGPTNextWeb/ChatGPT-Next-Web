"use client";
import { redirect } from "next/navigation";
// import { getSession } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Button, Checkbox, Form, Input } from "antd";

type LoginType = "phone" | "account";

export default function SetPasswordPage() {
  const { data: session, status } = useSession();
  // if (typeof window !== "undefined" && loading) return null;
  console.log("2222222", session);
  // @ts-expect-error
  if (!session?.user?.hasPassword) {
  }
  // else {
  //   redirect("/")
  // }
  return (
    <>
      <p>Signed in as {}</p>
      <div>需要设置一个密码</div>
      <Form></Form>

      <Button
        onClick={(e) => {
          e.preventDefault();
          window.location.href = "/";
        }}
      >
        跳过
      </Button>
    </>
  );
}
