"use client";

import { FC } from "react";
import { useHasHydrated } from "../hooks/use-hydrated";
import { Loading } from "../components/loading";
import { AuthProvider } from "./auth";
import { AccessProvider } from "./access";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => {
  const hasHydrated = useHasHydrated();

  if (!hasHydrated) {
    return <Loading />;
  }

  return (
    <AuthProvider>
      <AccessProvider>{children}</AccessProvider>
    </AuthProvider>
  );
};
