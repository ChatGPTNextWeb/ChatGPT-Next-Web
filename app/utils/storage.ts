/**
 * 按命名空间包装的LocalStorage
 *
 * Example:
 *   const storage = LocalStorage.getStorage('auth');
 *   storage.setItem('token');
 *   const token = storage.getItem('token');
 *
 * @export
 * @class LocalStorage
 */
export default class LocalStorage {
  private static _storages: any = {};

  /**
   * 获取一个命名的存储空间
   *
   * @static
   * @param {string} namespace
   * @returns {LocalStorage}
   * @memberof LocalStorage
   */
  static getStorage(namespace: string): LocalStorage {
    let storage = LocalStorage._storages[namespace];
    if (!storage) {
      storage = new LocalStorage(namespace);
      LocalStorage._storages[namespace] = storage;
    }
    return storage;
  }

  private _namespace: string;

  constructor(namespace: string) {
    this._namespace = namespace;
  }

  private getNamespacedKey(key: string): string {
    return `${this._namespace}:${key}`;
  }

  /**
   * 添加一对key-value
   *
   * @param {string} key
   * @param {string} val
   * @memberof LocalStorage
   */
  setItem(key: string, val: string) {
    localStorage.setItem(this.getNamespacedKey(key), val);
  }

  /**
   * 通过key获取value
   *
   * @param {string} key
   * @returns {(string | null)}
   * @memberof LocalStorage
   */
  getItem(key: string): string | null {
    return localStorage.getItem(this.getNamespacedKey(key));
  }

  /**
   * @param  {string} key
   * @returns void
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.getNamespacedKey(key));
  }
}
