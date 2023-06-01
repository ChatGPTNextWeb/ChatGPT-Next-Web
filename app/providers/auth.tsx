"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Loading } from "@/app/components/loading";
import { createContext } from "react";
import { UserResource } from "@clerk/types";
import { useHasHydrated } from "../hooks/use-hydrated";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContext {
  user: UserResource | null;
}

const AuthContext = createContext({ user: null } as AuthContext);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  const hasHydrated = useHasHydrated();

  if (!isLoaded || !hasHydrated) {
    return <Loading />;
  }

  if (!isSignedIn || !user) {
    router.push("/signin");
  }

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
};
