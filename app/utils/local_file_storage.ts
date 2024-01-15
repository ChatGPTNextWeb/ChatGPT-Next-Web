import fs from "fs";
import path from "path";

export default class LocalFileStorage {
  static async get(fileName: string) {
    const filePath = path.resolve(`./uploads`, fileName);
    const file = fs.readFileSync(filePath);
    if (!file) {
      throw new Error("not found.");
    }
    return file;
  }

  static async put(fileName: string, data: Buffer) {
    try {
      const filePath = path.resolve(`./uploads`, fileName);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      await fs.promises.writeFile(filePath, data);
      console.log("[LocalFileStorage]", filePath);
      return `/api/file/${fileName}`;
    } catch (e) {
      console.error("[LocalFileStorage]", e);
      throw e;
    }
  }
}
