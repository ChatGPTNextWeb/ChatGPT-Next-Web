"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
  DashboardTwoTone,
} from "@ant-design/icons";
import type { MenuProps, MenuTheme } from "antd";
import { Menu, Switch } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key?: React.Key | null,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group",
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem("面板", "dashboard", <AppstoreOutlined />, [
    getItem("使用分析", "/admin/ana"),
  ]),

  getItem("管理", "manage", <AppstoreOutlined />, [
    getItem("用户管理", "/admin/users"),
  ]),

  // getItem("Navigation Three", "sub4", <SettingOutlined />, [
  //   getItem("Option 9", "9"),
  //   getItem("Option 10", "10"),
  //   getItem("Option 11", "11"),
  //   getItem("Option 12", "12"),
  // ]),
];

const SideBar: React.FC = () => {
  const [theme, setTheme] = useState<MenuTheme>("dark");
  const [current, setCurrent] = useState("/admin/ana");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  // const changeTheme = (value: boolean) => {
  //     setTheme(value ? 'dark' : 'light');
  // };

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
    router.push(e.key);
  };
  useEffect(() => {
    // 如果按钮和路径不相等，那其实应该跳转到按钮的网址
    if (current != pathname) {
      router.push(current);
    }
  }, [current, pathname, router]);

  return (
    <>
      <br />
      <br />
      <Menu
        theme={theme}
        onClick={onClick}
        // style={{ width: 256 }}
        defaultOpenKeys={["dashboard"]}
        selectedKeys={[current]}
        mode="inline"
        items={items}
      />
    </>
  );
};

export default SideBar;
