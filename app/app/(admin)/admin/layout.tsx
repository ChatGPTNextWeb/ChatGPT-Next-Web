"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout, Menu, Button, theme, ConfigProvider, ThemeConfig } from "antd";
import SideBar from "../components/sidebar";

const { Header, Sider, Content } = Layout;

function MainLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined" && window.innerWidth < 768,
  );
  const {
    token: { colorBgContainer, borderRadiusLG, colorBgLayout },
  } = theme.useToken();
  // 处理布局
  useEffect(() => {
    const handleResize = () => {
      // 更新折叠状态以匹配屏幕宽度
      setCollapsed(typeof window !== "undefined" && window.innerWidth < 768);
    };
    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);
    // 组件卸载时移除监听器
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // 客户端才执行
  // useEffect(() => {
  //   // 用户已登录，且没设置密码
  //   // if (status === "loading") return;
  //   if (status === "authenticated" && !(name && ADMIN_LIST.includes(name))) {
  //     redirect("/");
  //   }
  //   // 状态变化时，重新判断
  // }, [name, status]);
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
        <Sider
          breakpoint={"md"}
          collapsedWidth="0"
          collapsed={collapsed}
          trigger={null}
        >
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
            id="admin-page-content"
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
