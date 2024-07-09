import { initDB, useIndexedDB } from "react-indexed-db-hook";
import { StabilityPath, StoreKey } from "@/app/constant";
import { create, StoreApi } from "zustand";
import { showToast } from "@/app/components/ui-lib";

export const SdDbConfig = {
  name: "@chatgpt-next-web/sd",
  version: 1,
  objectStoresMeta: [
    {
      store: StoreKey.SdList,
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "model", keypath: "model", options: { unique: false } },
        {
          name: "model_name",
          keypath: "model_name",
          options: { unique: false },
        },
        { name: "status", keypath: "status", options: { unique: false } },
        { name: "params", keypath: "params", options: { unique: false } },
        { name: "img_data", keypath: "img_data", options: { unique: false } },
        { name: "error", keypath: "error", options: { unique: false } },
        {
          name: "created_at",
          keypath: "created_at",
          options: { unique: false },
        },
      ],
    },
  ],
};

export function SdDbInit() {
  initDB(SdDbConfig);
}

type SdStore = {
  execCount: number;
  execCountInc: () => void;
};

export const useSdStore = create<SdStore>()((set) => ({
  execCount: 1,
  execCountInc: () => set((state) => ({ execCount: state.execCount + 1 })),
}));

export function sendSdTask(data: any, db: any, inc: any, okCall?: Function) {
  db.add(data).then(
    (id: number) => {
      data = { ...data, id, status: "running" };
      db.update(data);
      inc();
      stabilityRequestCall(data, db, inc);
      okCall?.();
    },
    (error: any) => {
      console.error(error);
      showToast(`error: ` + error.message);
    },
  );
}

export function stabilityRequestCall(data: any, db: any, inc: any) {
  const formData = new FormData();
  for (let paramsKey in data.params) {
    formData.append(paramsKey, data.params[paramsKey]);
  }
  fetch(`/api/stability/${StabilityPath.GeneratePath}/${data.model}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((resData) => {
      if (resData.errors && resData.errors.length > 0) {
        db.update({ ...data, status: "error", error: resData.errors[0] });
        inc();
        return;
      }
      if (resData.finish_reason === "SUCCESS") {
        db.update({ ...data, status: "success", img_data: resData.image });
      } else {
        db.update({ ...data, status: "error", error: JSON.stringify(resData) });
      }
      inc();
    })
    .catch((error) => {
      db.update({ ...data, status: "error", error: error.message });
      console.error("Error:", error);
      inc();
    });
}
