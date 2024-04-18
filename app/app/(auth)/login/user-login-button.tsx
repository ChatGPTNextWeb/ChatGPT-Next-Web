"use client";

import { signIn } from "next-auth/react";
import React, { useState, useEffect, useRef, use } from "react";
import { isName } from "@/lib/auth_list";
import { Form, Input, InputRef } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { SignInOptions } from "next-auth/react";

export default function UserLoginButton() {
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const nameInput = useRef<InputRef>(null);
  const passwordInput = useRef<InputRef>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(false);
  type FieldType = {
    username?: string;
    password?: string;
    email?: string;
  };
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    setLoading(true);
    let signInOptions: SignInOptions = {
      redirect: false,
    };
    let loginProvider = "";

    if (values.email) {
      loginProvider = "email";
      signInOptions = { ...signInOptions, email: values.email };
    } else {
      loginProvider = "credentials";
      signInOptions = {
        ...signInOptions,
        username: values.username,
        password: values.password ?? "",
      };
    }
    signIn(loginProvider, signInOptions).then((result) => {
      setLoading(false);
      if (!result?.error) {
        window.location.href =
          result?.url && result.url.includes("verify") ? result.url : "/";
      } else {
        const errorParts = result.error.split(",");
        if (errorParts.length > 1) {
          loginForm.setFields([
            {
              name: errorParts[0],
              errors: [errorParts[1]],
            },
          ]);
        } else {
          loginForm.setFields([
            {
              name: "password",
              errors: [result.error],
            },
          ]);
        }
      }
      console.log("response,", result);
    });

    setLoading(false);
    console.log("Success:", values);
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  const handleNameComposition = (
    e: React.CompositionEvent<HTMLInputElement>,
  ) => {
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
  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if ((e.nativeEvent as InputEvent).isComposing) {
      return;
    }
    setPassword(e.target.value);
  };
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    // handle yow submition
    setLoading(true);
    e.preventDefault();

    let result: { error: any; url: string | null } | undefined = {
      error: null,
      url: null,
    };
    if (emailInput.current && emailInput.current.value) {
      result = await signIn("email", {
        email: emailInput.current.value,
        redirect: false,
      });
    } else {
      result = await signIn("credentials", {
        username: username,
        password: password,
        redirect: false,
      });
    }
    console.log("0000000000000", result);
    setLoading(false);
    if (!result?.error) {
      window.location.href =
        result?.url && result.url.includes("verify") ? result.url : "/";
    } else setError(true);
  };

  useEffect(() => {
    if (!username) return;
    if (nameInput.current) {
      if (!isName(username)) {
        setError(true);
        // nameInput
        // nameInput.current.setCustomValidity("用户名校验失败");
      } else {
        setError(false);
        // nameInput.current.setCustomValidity("");
      }
    }
    // console.log("username:", username);
  }, [username]);

  return (
    <>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form
          className="space-y-6"
          // action="#"
          // method="POST"
          autoComplete="off"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          size="large"
          form={loginForm}
          id="login-form"
          // onSubmit={onSubmitHandler}
        >
          <div>
            <Form.Item
              name="username"
              rules={[
                {
                  validator: async (_, value) => {
                    if (value && !isName(value)) {
                      return Promise.reject(
                        new Error("Invalid username format!"),
                      );
                    }
                    const email_value = loginForm.getFieldValue("email");
                    if (!value && !email_value) {
                      return Promise.reject(
                        new Error("Please input your username!"),
                      );
                    }
                    if (value && email_value) {
                      return Promise.reject(new Error("Field must be unique!"));
                    }
                    const password_value = loginForm.getFieldValue("password");
                    if (!value && password_value) {
                      return Promise.reject(
                        new Error("Please input your username!"),
                      );
                    }
                  },
                },
              ]}
            >
              <Input
                // id="basic_username"
                // name="username"
                // type="username"
                // ref={nameInput}
                // // value={username}
                // onCompositionStart={(e) => e.preventDefault()}
                // onCompositionEnd={handleNameComposition}
                // onChange={onNameChange}
                // required
                autoComplete="off"
                prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="输入姓名、拼音或邮箱"
                className={
                  "text-sm font-medium text-stone-600 dark:text-stone-400"
                }
                //   className={`${
                //     loading
                //       ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                //       : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
                //   } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700
                //   ${
                //     error
                //       ? "focus:invalid:border-red-500 focus:invalid:ring-red-500"
                //       : ""
                //   }
                // `}
              />
            </Form.Item>

            <Form.Item<FieldType>
              // label="Password"
              name="password"
              rules={[
                {
                  validator: async (_, value) => {
                    if (value) {
                      if (value.length < 6) {
                        return Promise.reject(
                          new Error("Password must be at least 6 characters!"),
                        );
                      }
                    }
                  },
                },
              ]}
            >
              <Input.Password
                //   id="basic_password"
                //   name="password"
                //   type="password"
                //   status={error ? "error" : ""}
                //   ref={passwordInput}
                //   value={password}
                //   // onCompositionStart={(e) => e.preventDefault()}
                //   // onCompositionEnd={handleComposition}
                //   onChange={onPasswordChange}
                autoComplete="off"
                //   // required
                placeholder="密码验证，测试阶段"
                className={
                  "text-sm font-medium text-stone-600 dark:text-stone-400"
                }
                //   className={`${
                //     loading
                //       ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                //       : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
                //   } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700
                //   ${
                //     error
                //       ? "focus:invalid:border-red-500 focus:invalid:ring-red-500"
                //       : ""
                //   }
                // `}
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
                {
                  validator: async (_, value) => {
                    const username_value = loginForm.getFieldValue("username");
                    if (value && username_value) {
                      return Promise.reject(new Error("Field must be unique!"));
                    }
                  },
                },
              ]}
            >
              <Input
                // id="email"
                // name="email"
                // type="email"
                // ref={emailInput}
                // value={username}
                // onCompositionStart={(e) => e.preventDefault()}
                // onCompositionEnd={handleComposition}
                // onChange={onNameChange}
                // required
                prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="邮箱验证，测试阶段"
                className={
                  "text-sm font-medium text-stone-600 dark:text-stone-400"
                }
                //   className={`${
                //     loading
                //       ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                //       : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
                //   } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700
                //   ${
                //     error
                //       ? "focus:invalid:border-red-500 focus:invalid:ring-red-500"
                //       : ""
                //   }
                // `}
              />
            </Form.Item>
          </div>

          <Form.Item>
            <button
              disabled={loading}
              // onClick={() => loginForm.submit()}
              type="submit"
              className={`${
                loading
                  ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                  : "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              }`}
            >
              Sign in
            </button>
          </Form.Item>
        </Form>
      </div>
      {/*</div>*/}
    </>
  );
}
