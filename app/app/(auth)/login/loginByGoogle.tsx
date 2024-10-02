"use client";

import LoadingDots from "@/app/components/icons/loading-dots";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { GoogleCircleFilled } from "@ant-design/icons";
export default function LoginByGoogle() {
  const [loading, setLoading] = useState(false);

  return (
    <div
      className={`group my-2 flex h-10 w-1/12 items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700 `} //
    >
      <button
        disabled={loading}
        onClick={(e) => {
          setLoading(true);
          e.preventDefault();
          signIn("google", { redirect: false }).then((r) => {
            console.log("[auth log]", r);
          });
        }}
        className={`bg-transparent hover:bg-transparent`}
      >
        {loading ? (
          <LoadingDots color="#A8A29E" />
        ) : (
          <>
            {/*<svg*/}
            {/*  className="h-6 w-6 text-gray-500 dark:text-white"*/}
            {/*  aria-hidden="true"*/}
            {/*  fill="currentColor"*/}
            {/*  viewBox="0 0 24 24"*/}
            {/*>*/}
            {/* */}
            {/*</svg>*/}
            <GoogleCircleFilled
              style={{
                fontSize: "24px",
                color: "rgb(107 114 128/var(--tw-text-opacity)) !import",
              }}
            />
            {/*<p className="text-sm font-medium text-stone-600 dark:text-stone-400">*/}
            {/*  Login with GitHub*/}
            {/*</p>*/}
          </>
        )}
      </button>
      <div className={`w-1`}></div>
    </div>
  );
}
