import { getServerSideConfig } from "@/app/config/server";
import { DallEAPIWrapper } from "./dalle_image_generator";
import S3FileStorage from "@/app/utils/s3_file_storage";
import LocalFileStorage from "@/app/utils/local_file_storage";

export class DallEAPINodeWrapper extends DallEAPIWrapper {
  async saveImageFromUrl(url: string) {
    const response = await fetch(url);
    const content = await response.arrayBuffer();
    const buffer = Buffer.from(content);

    var filePath = "";
    const serverConfig = getServerSideConfig();
    var fileName = `${Date.now()}.png`;
    if (serverConfig.isStoreFileToLocal) {
      filePath = await LocalFileStorage.put(fileName, buffer);
    } else {
      filePath = await S3FileStorage.put(fileName, buffer);
    }
    return filePath;
  }
}
