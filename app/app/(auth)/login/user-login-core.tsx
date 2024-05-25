"use client";

import { signIn } from "next-auth/react";
import React, { useState, useEffect, useRef, use } from "react";
import { isName } from "@/lib/auth_list";
import {
  Form,
  Tabs,
  Input,
  InputRef,
  notification as notificationModule,
  NotificationArgsProps,
} from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import type { FormProps, TabsProps } from "antd";
import { SignInOptions } from "next-auth/react";
import { getSession } from "next-auth/react";

export default function UserLoginCore() {
  const [loading, setLoading] = useState(false);
  const [loginForm] = Form.useForm();
  const [loginMethod, setLoginMethod] = useState<"common" | "cap">("common");
  const [notification, notificationContextHolder] =
    notificationModule.useNotification();

  const openNotification = (level: string, arms: NotificationArgsProps) => {
    if (level === "error") {
      notification.error({
        ...arms,
        placement: "topRight",
      });
    } else {
      notification.info({
        ...arms,
        placement: "topRight",
      });
    }
  };

  // const [error, setError] = useState(false);
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

    if (loginMethod === "cap") {
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
        // 如果没有密码，且登录成功了，说明需要设置密码
        let result_url =
          result?.url && result.url.includes("verify") ? result.url : "/";

        // 手动获取一遍session
        getSession()
          .then((value) => {
            // @ts-expect-error
            if (!value?.user?.hasPassword) {
              if (result_url === "/") {
                result_url = "/login/set-password";
              }
            }
          })
          .finally(() => {
            window.location.href = result_url;
          });
      } else {
        switch (result.error) {
          case "AccessDenied":
            openNotification("error", {
              message: "登录失败",
              description: (
                <span>
                  无权限，请确认用户名正确并等待审批
                  <br />
                  <span style={{ color: "red" }}>或联系管理员</span>
                </span>
              ),
            });
            break;
          default:
            break;
        }

        if (loginProvider === "credentials") {
          loginForm.setFields([
            {
              name: "username",
              errors: [result.error],
            },
            {
              name: "password",
              errors: [result.error],
            },
          ]);
        }
        if (loginProvider === "email") {
          loginForm.setFields([
            {
              name: "email",
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

  const onTabsChange = (key: "common" | "cap") => {
    console.log(key);
    setLoginMethod(key);
  };

  const tabItems = [
    {
      key: "common",
      label: "账号密码登录",
      children: "",
    },
    {
      key: "cap",
      label: "验证码登录",
      children: "",
    },
  ];

  return (
    <>
      {notificationContextHolder}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <Tabs
          centered
          defaultActiveKey={loginMethod}
          items={tabItems}
          onChange={(key) => onTabsChange(key as "common" | "cap")}
        ></Tabs>
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
            {loginMethod === "common" && (
              <>
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
                        // const email_value = loginForm.getFieldValue("email");
                        // if (!value && !email_value) {
                        //   return Promise.reject(
                        //     new Error("Please input your username!"),
                        //   );
                        // }
                        // if (value && email_value) {
                        //   return Promise.reject(new Error("Field must be unique!"));
                        // }
                        const password_value =
                          loginForm.getFieldValue("password");
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
                    autoComplete="off"
                    prefix={
                      <UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="输入姓名、拼音或邮箱"
                    className={
                      "text-sm font-medium text-stone-600 dark:text-stone-400"
                    }
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
                              new Error(
                                "Password must be at least 6 characters!",
                              ),
                            );
                          }
                        }
                      },
                    },
                  ]}
                >
                  <Input.Password
                    autoComplete="off"
                    //   // required
                    placeholder="密码验证，测试阶段"
                    className={
                      "text-sm font-medium text-stone-600 dark:text-stone-400"
                    }
                  />
                </Form.Item>
              </>
            )}
            {loginMethod === "cap" && (
              <>
                <Form.Item
                  name="email"
                  rules={[
                    {
                      type: "email",
                      message: "The input is not valid E-mail!",
                    },
                    // {
                    //   validator: async (_, value) => {
                    //     const username_value = loginForm.getFieldValue("username");
                    //     if (value && username_value) {
                    //       return Promise.reject(new Error("Field must be unique!"));
                    //     }
                    //   },
                    // },
                  ]}
                >
                  <Input
                    prefix={
                      <MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="邮箱验证，测试阶段"
                    className={
                      "text-sm font-medium text-stone-600 dark:text-stone-400"
                    }
                  />
                </Form.Item>
              </>
            )}
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
