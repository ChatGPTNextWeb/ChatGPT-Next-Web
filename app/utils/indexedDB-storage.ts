import { StateStorage } from "zustand/middleware";
import { get, set, del, clear } from "idb-keyval";

class IndexedDBStorage implements StateStorage {
  public async getItem(name: string): Promise<string | null> {
    try {
      const value = (await get(name)) || localStorage.getItem(name);
      const _value = JSON.parse(value);
      if (_value?.state) {
        _value.state._hasHydrated = true;
      }
      return JSON.stringify(_value);
    } catch (error) {
      return localStorage.getItem(name);
    }
  }

  public async setItem(name: string, value: string): Promise<void> {
    try {
      const _value = JSON.parse(value);
      if (!_value?.state?._hasHydrated) {
        return;
      }
      await set(name, value);
    } catch (error) {
      localStorage.setItem(name, value);
    }
  }

  public async removeItem(name: string): Promise<void> {
    try {
      await del(name);
    } catch (error) {
      localStorage.removeItem(name);
    }
  }

  public async clear(): Promise<void> {
    try {
      await clear();
    } catch (error) {
      localStorage.clear();
    }
  }
}

export const indexedDBStorage = new IndexedDBStorage();
