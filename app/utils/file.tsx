"use client";
import { initDB } from "react-indexed-db-hook";
import { StoreKey } from "@/app/constant";
import { useIndexedDB } from "react-indexed-db-hook";

export const FileDbConfig = {
  name: "@chatgpt-next-web/file",
  version: 1,
  objectStoresMeta: [
    {
      store: StoreKey.File,
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [
        { name: "data", keypath: "data", options: { unique: false } },
        {
          name: "created_at",
          keypath: "created_at",
          options: { unique: false },
        },
      ],
    },
  ],
};

export function FileDbInit() {
  initDB(FileDbConfig);
}

export function useFileDB() {
  return useIndexedDB(StoreKey.File);
}
