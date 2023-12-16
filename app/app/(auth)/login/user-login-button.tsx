"use client";

import { signIn } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import { isName } from "@/lib/auth";

export default function UserLoginButton() {
  const [loading, setLoading] = useState(false);

  const nameInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState(false);

  const handleComposition = (e: React.CompositionEvent<HTMLInputElement>) => {
    if (e.type === "compositionend") {
      setUsername(e.currentTarget.value);
    }
  };
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as InputEvent).isComposing) {
      return;
    }
    setUsername(e.target.value);
  };
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    // handle yow submition
    setLoading(true);
    e.preventDefault();

    console.log("current,username2", username);
    const result = await signIn("credentials", {
      username: username,
      redirect: false,
    });
    setLoading(false);
    if (!result?.error) {
      window.location.href = "/";
    } else setError(true);
  };

  useEffect(() => {
    if (nameInput.current) {
      if (!isName(username)) {
        setError(true);
        nameInput.current.setCustomValidity("用户名校验失败");
      } else {
        setError(false);
        nameInput.current.setCustomValidity("");
      }
    }
    // console.log("username:", username);
  }, [username]);

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form
          className="space-y-6"
          action="#"
          method="POST"
          autoComplete="off"
          onSubmit={onSubmitHandler}
        >
          <div>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="username"
                ref={nameInput}
                // value={username}
                onCompositionStart={(e) => e.preventDefault()}
                onCompositionEnd={handleComposition}
                onChange={onNameChange}
                required
                placeholder="输入姓名、拼音或邮箱"
                className={`${
                  loading
                    ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                    : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
                } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700
                  ${
                    error
                      ? "focus:invalid:border-red-500 focus:invalid:ring-red-500"
                      : ""
                  }
                `}
              />
              {/*{error && <p className="mt-2 text-pink-600 text-sm">{error}</p>}*/}
            </div>
          </div>

          <div>
            <button
              disabled={loading}
              // onClick={(e) => handleSubmit(e)}
              type="submit"
              className={`${
                loading
                  ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                  : "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              }`}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
      {/*</div>*/}
    </>
  );
}
