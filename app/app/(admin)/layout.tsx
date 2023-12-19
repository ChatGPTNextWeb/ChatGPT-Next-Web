import "@/app/app/login.scss";
import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin | 管理页面",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Admin Page
        </h1>
        {children}
      </div>
    </div>
  );
}
