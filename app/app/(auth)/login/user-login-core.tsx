"use client";

import { signIn } from "next-auth/react";
import React, { useState, useEffect, useMemo } from "react";
import { isName } from "@/lib/auth_list";
import {
  Form,
  Tabs,
  Input,
  notification as notificationModule,
  NotificationArgsProps,
} from "antd";
import { UserOutlined, MailOutlined, LoadingOutlined } from "@ant-design/icons";
import type { FormProps } from "antd";
import { SignInOptions } from "next-auth/react";
import { getSession } from "next-auth/react";

export default function UserLoginCore() {
  const [loading, setLoading] = useState(false);
  const [capLoading, setCapLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
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

  useEffect(() => {
    let timer = undefined;
    if (timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    }

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const capIcon = useMemo(() => {
    if (capLoading) {
      return (
        <LoadingOutlined
          style={{
            fontSize: 16,
            color: "rgb(234, 149, 24)",
          }}
        />
      );
    }
    return <></>;
  }, [capLoading]);
  const sendCap = () => {
    loginForm.validateFields().then((values) => {
      setCapLoading(true);
      signIn("email", {
        redirect: false,
        email: values.email,
      }).then((result) => {
        // console.log("33333333333", result);
        setCapLoading(false);
        setTimeLeft(60);
      });
    });

    // const email = loginForm.getFieldValue("email");
    // console.log('----------', email)
  };

  // const [error, setError] = useState(false);
  type FieldType = {
    username?: string;
    password?: string;
    email?: string;
    cap?: string;
  };
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    setLoading(true);
    let signInOptions: SignInOptions = {
      redirect: false,
    };
    let loginProvider = "";

    if (loginMethod === "cap") {
      loginProvider = "email";
      signInOptions = {
        ...signInOptions,
        email: values.email,
        cap: values.cap,
      };
      fetch(
        `/api/auth/callback/email?token=${values.cap}&email=${values.email}`,
      ).then((result) => {
        // console.log("------------", result);
        if (result.redirected) {
          window.location.href = result.url;
        }
      });
      return;
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
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    addonAfter={
                      <button
                        onClick={sendCap}
                        disabled={capLoading || timeLeft > 0}
                        className="align-bottom"
                      >
                        {capLoading ? (
                          <span style={{ width: "70px" }}>
                            <LoadingOutlined
                              style={{
                                fontSize: 16,
                                color: "rgb(234, 149, 24)",
                              }}
                            />
                          </span>
                        ) : timeLeft > 0 ? (
                          <span style={{ color: "gray" }}>
                            {timeLeft}秒后重试
                          </span>
                        ) : (
                          "发送验证码"
                        )}
                      </button>
                    }
                    size="middle"
                    placeholder="邮箱验证，测试阶段"
                    className={
                      "text-sm font-medium text-stone-600 dark:text-stone-400"
                    }
                  />
                </Form.Item>
                <Form.Item
                  name="cap"
                  rules={[
                    {
                      len: 4,
                      message: "Make sure it's at 4 characters",
                    },
                  ]}
                >
                  <Input
                    size="middle"
                    placeholder="验证码"
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
