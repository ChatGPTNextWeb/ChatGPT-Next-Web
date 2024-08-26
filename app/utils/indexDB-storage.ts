import { StateStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

class IndexDBStorage implements StateStorage {
  constructor() {}

  public async getItem(name: string): Promise<string | null> {
    return (await get(name)) || localStorage.getItem(name);
  }

  public async setItem(name: string, value: string): Promise<void> {
    await set(name, value);
  }

  public async removeItem(name: string): Promise<void> {
    await del(name);
  }
}

export const indexDBStorage = new IndexDBStorage();
