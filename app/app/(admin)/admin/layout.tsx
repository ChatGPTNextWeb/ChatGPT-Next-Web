"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ADMIN_LIST } from "@/lib/auth_list";
import React, { ReactNode, useEffect, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme, ConfigProvider, ThemeConfig } from "antd";
import SideBar from "../components/sidebar";

const { Header, Sider, Content } = Layout;

function MainLayout({ children }: { children: ReactNode }) {
  // const [theme, setTheme] = useState<ThemeConfig>('dark');
  const { data, status } = useSession();
  const name = data?.user?.email || data?.user?.name;
  // console.log('name', name, data, status)
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();

  // 客户端才执行
  useEffect(() => {
    // 用户已登录，且没设置密码
    // if (status === "loading") return;
    if (status === "authenticated" && !(name && ADMIN_LIST.includes(name))) {
      redirect("/");
    }
    // 状态变化时，重新判断
  }, [name, status]);
  return (
    <ConfigProvider
      theme={{
        // 1. 单独使用暗色算法
        algorithm: theme.defaultAlgorithm,
        // token: {
        //     colorPrimary: "#00b96b",
        // }
      }}
    >
      <Layout style={{ height: "100%" }}>
        <Sider>
          <div className="demo-logo-vertical" />*
          <SideBar />
        </Sider>

        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: "16px",
                width: 64,
                height: 64,
              }}
            />
          </Header>
          <Content
            style={{
              // margin: "24px 16px",
              padding: 24,
              minHeight: 280,
              background: colorBgLayout,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default MainLayout;
