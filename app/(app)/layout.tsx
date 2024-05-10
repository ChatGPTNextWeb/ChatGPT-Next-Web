"use client";

import React from "react";
import { AuthPage } from "@/app/components/auth";
import { SideBar } from "@/app/containers/Sidebar";
import Screen from "@/app/components/Screen";

export interface MenuWrapperInspectProps {
  setExternalProps?: (v: Record<string, any>) => void;
  setShowPanel?: (v: boolean) => void;
  showPanel?: boolean;
  [k: string]: any;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Screen noAuth={<AuthPage />} sidebar={<SideBar />}>
      {children}
    </Screen>
  );
}
