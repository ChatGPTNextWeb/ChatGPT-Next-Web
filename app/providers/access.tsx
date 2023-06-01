"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { Access } from "../hooks/use-access";
import { useAccess } from "../hooks/use-access";
import { Loading } from "../components/loading";

interface AccessProviderProps {
  children: React.ReactNode;
}

interface AccessContext {
  access: Access | null;
}

const AccessContext = createContext({ access: null } as AccessContext);

export const AccessProvider = ({ children }: AccessProviderProps) => {
  const { data, error, loading } = useAccess();
  const router = useRouter();

  if (loading || !data) {
    return <Loading />;
  }

  if (error) {
    return <p>This shouldnt have happened</p>;
  }

  if (!data.hasAppAccess) {
    router.push("/plans");
    return <Loading />;
  }

  return (
    <AccessContext.Provider value={{ access: data }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccessContext = () => {
  const context = useContext(AccessContext);

  if (context === undefined) {
    throw new Error("useAccessContext must be used within a AccessProvider");
  }
  return context;
};
