import LoginByGithub from "./loginByGithub";
import LoginByGoogle from "./loginByGoogle";
import UserLoginCore from "./user-login-core";
import { Suspense } from "react";
import { Space } from "antd";

export default function LoginPage() {
  return (
    <>
      {/*<hr></hr>*/}
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        {/*<Suspense*/}
        {/*  fallback={*/}
        {/*    <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />*/}
        {/*  }*/}
        {/*>*/}
        {/*  */}
        {/*</Suspense>*/}
        <Suspense>
          <UserLoginCore />
        </Suspense>
      </div>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full inline-flex items-center justify-center">
        {/*<Suspense*/}
        {/*  fallback={*/}
        {/*    <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />*/}
        {/*  }*/}
        {/*>*/}
        {/*  */}
        {/*</Suspense>*/}
        <span className="inline-block align-middle text-left w-5/12">
          {" "}
          其它登录方式{" "}
        </span>
        <Space size="1">
          <LoginByGithub />
          <LoginByGoogle />
        </Space>
        <div className="w-5/12" />
      </div>
    </>
  );
}
