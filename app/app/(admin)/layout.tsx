import "@/app/app/login.scss";
import { Metadata } from "next";
import { ReactNode } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
// import Head from "next/head";

export const metadata: Metadata = {
  title: "Admin | 管理页面",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AntdRegistry>
        {children}

        {/*<div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 w-full">*/}
        {/*  <div className="w-full">*/}
        {/*    <h1 className="mt-6 text-center font-cal text-3xl dark:text-white">*/}
        {/*      Admin Page*/}
        {/*    </h1>*/}
        {/*    <div className="mx-auto mt-4 w-11/12 max-w-screen-lg sm:w-full">*/}
        {/*      {children}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </AntdRegistry>
    </>
  );
}
