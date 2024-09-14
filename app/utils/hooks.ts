import { useMemo } from "react";
import { useAccessStore, useAppConfig } from "../store";
import { collectModels, collectModelsWithDefaultModel } from "./model";
import { useSession } from "next-auth/react";

export function useAllModels() {
  const accessStore = useAccessStore();
  const configStore = useAppConfig();
  const { data: session, status } = useSession();

  const models = useMemo(() => {
    return collectModelsWithDefaultModel(
      configStore.models,
      [configStore.customModels, accessStore.customModels].join(","),
      accessStore.defaultModel,
    ).filter((m) => !configStore.dontUseModel.includes(m.name as any));
  }, [
    accessStore.customModels,
    accessStore.defaultModel,
    configStore.customModels,
    configStore.models,
    configStore.dontUseModel,
  ]);

  // -@ts-expect-error
  // if (status === "authenticated" && !session?.user?.isAdmin) {
  //   // TODO: 过滤非管理员用户可使用的模型
  //   return models.filter((m) => !m.name.endsWith("-all"));
  // }
  return models;
}
