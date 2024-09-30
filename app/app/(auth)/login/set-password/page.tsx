"use client";
// import { getSession } from "@/lib/auth";
import { useSession } from "next-auth/react";
import { Form, FormProps, Input } from "antd";
import { LockOutlined } from "@ant-design/icons";
// import React from "react";
import { signOut } from "next-auth/react";

type LoginType = "phone" | "account";

export default function SetPasswordPage() {
  // const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  // const [showOldPassword, setShowOldPassword] = useState<Boolean>(true);
  const [setPasswordForm] = Form.useForm();
  // if (typeof window !== "undefined" && loading) return null;
  // console.log("2222222", session);
  // @ ts-expect-error
  // if (!session?.user?.hasPassword) {
  //   setShowOldPassword(false);
  // }
  //     if (status === "authenticated") {
  //         console.log('55555,', session, status)
  //         // @ts-expect-error
  //         if (session?.user?.hasPassword) {
  //             setShowOldPassword(false);
  //         }
  //     }
  //     console.log('---', session)
  type FieldType = {
    "user[old_password]"?: string;
    "user[password]"?: string;
    "user[password_confirmation]"?: string;
  };
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    // setLoading(true);
    // console.log('-------------', values)
    fetch(`/api/user/${session?.user?.id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result["result"] == "ok") {
          signOut({ redirect: true, callbackUrl: "/login" });
        }
        // console.log("--------", result);
      });
  };

  return (
    <>
      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <Form
          autoComplete="off"
          form={setPasswordForm}
          id="set-password-form"
          layout="vertical"
          onFinish={onFinish}
        >
          {status === "authenticated" && session?.user?.hasPassword && (
            <Form.Item
              name="user[old_password]"
              label="Old password"
              rules={[
                {
                  validator: async (_, value) => {
                    if (!value) {
                      return Promise.reject(new Error("请填写该字段"));
                    }
                  },
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                autoComplete="current-password"
                id="user_old_password"
              />
            </Form.Item>
          )}

          <Form.Item
            name="user[password]"
            label="New password"
            rules={[
              {
                min: 6,
                message: "Make sure it's at least 6 characters",
              },
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error("请填写该字段"));
                  }
                },
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              autoComplete="off"
              id="user_new_password"
            />
          </Form.Item>
          <Form.Item
            name="user[password_confirmation]"
            label="Confirm new password"
            rules={[
              {
                validator: async (_, value) => {
                  if (!value) {
                    return Promise.reject(new Error("请填写该字段"));
                  }
                  const new_password =
                    setPasswordForm.getFieldValue("user[password]");
                  if (value !== new_password) {
                    return Promise.reject(new Error("密码不一致"));
                  }
                },
              },
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              autoComplete="new-password"
              aria-autocomplete="list"
              id="user_confirm_new_password"
            />
          </Form.Item>

          <Form.Item>
            <a href="/" className="mr-2.5 align-bottom">
              暂时跳过
            </a>
            <button
              type="submit"
              className="short-width-button w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Submit
            </button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
