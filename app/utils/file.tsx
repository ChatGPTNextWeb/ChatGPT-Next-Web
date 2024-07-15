import { useState, useMemo, useEffect } from "react";
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
  if (typeof window !== "undefined") {
    initDB(FileDbConfig);
  }
}

export function useFileDB() {
  return useIndexedDB(StoreKey.File);
}

export function saveFileData(db, fileId, data) {
  // save file content and return url start with `indexeddb://`
  db.add({ id: fileId, data });
  return `indexeddb://${StoreKey.File}@${fileId}`;
}

export async function getFileData(db, fileId, contentType = "image/png") {
  const { data } = await db.getByID(fileId);
  return `data:${contentType};base64,${data}`;
}

export function IndexDBImage({ src, alt, onClick, db, className }) {
  const [data, setData] = useState(src);
  const imgId = useMemo(
    () => src.replace("indexeddb://", "").split("@").pop(),
    [src],
  );
  useEffect(() => {
    getFileData(db, imgId)
      .then((data) => setData(data))
      .catch((e) => setData(src));
  }, [src, imgId]);

  return (
    <img
      className={className}
      src={data}
      alt={alt}
      onClick={(e) => onClick(data, e)}
    />
  );
}
