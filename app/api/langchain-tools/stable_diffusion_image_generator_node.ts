import S3FileStorage from "@/app/utils/s3_file_storage";
import { StableDiffusionWrapper } from "./stable_diffusion_image_generator";
import { getServerSideConfig } from "@/app/config/server";
import LocalFileStorage from "@/app/utils/local_file_storage";

export class StableDiffusionNodeWrapper extends StableDiffusionWrapper {
  async saveImage(imageBase64: string) {
    var filePath = "";
    var fileName = `${Date.now()}.png`;
    const buffer = Buffer.from(imageBase64, "base64");
    const serverConfig = getServerSideConfig();
    if (serverConfig.isStoreFileToLocal) {
      filePath = await LocalFileStorage.put(fileName, buffer);
    } else {
      filePath = await S3FileStorage.put(fileName, buffer);
    }
    return filePath;
  }
}
