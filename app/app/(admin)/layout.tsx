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
    <div className="container mx-auto">
      <div className="relative h-32 w-32"></div>
      <div className="absolute inset-x-0 top-0 h-16">
        <h1 className="font-cal text-3xl font-bold dark:text-white mx-auto">
          Admin Page
        </h1>
      </div>
      {children}
    </div>
  );
}
