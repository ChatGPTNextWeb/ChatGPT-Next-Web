import { useMemo, useEffect } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModels, collectModelsWithDefaultModel } from "./model";
import { getToken, isTokenExpired, setToken } from "@/app/utils/tokenManager";
import { useRouter } from "next/navigation";
import { Path } from "../constant";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const models = useMemo(() => {
    return collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    );
  }, [
    accessStore.customModels,
    configStore.customModels,
    configStore.models,
    accessStore.defaultModel,
  ]);

  return models;
}

export const useTokenRefresh = () => {
  const router = useRouter();
  useEffect(() => {
    const refreshToken = async () => {
      const currentToken = getToken();

      if (currentToken && isTokenExpired()) {
        try {
          const response = await fetch(
            "https://cloak.invisibility.so/auth/token/refresh",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${currentToken}`,
              },
            },
          );
          if (!response.ok) throw new Error("Failed to refresh token");
          const data = await response.json();
          const newToken = data.token;
          setToken(newToken);
          useAccessStore.setState({ openaiApiKey: newToken, isLoggedin: true });
        } catch (err) {
          console.error("Error refreshing token", err);
          useAccessStore.setState({ isLoggedin: false });
          if (process.env.NODE_ENV === "development") {
            router.push(Path.LoginDev);
          } else {
            router.push(Path.Login);
          }
        }
      }
    };
    refreshToken();
  }, [router]);
};
