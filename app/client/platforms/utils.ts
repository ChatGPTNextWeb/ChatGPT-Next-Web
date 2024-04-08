import { getHeaders } from "../api";

export interface FileInfo {
  originalFilename: string;
  fileName: string;
  filePath: string;
  size: number;
}

export class FileApi {
  async upload(file: any): Promise<FileInfo> {
    const fileName = file.name;
    const fileSize = file.size;
    const formData = new FormData();
    formData.append("file", file);
    var headers = getHeaders(true);
    const api = "/api/file/upload";
    var res = await fetch(api, {
      method: "POST",
      body: formData,
      headers: {
        ...headers,
      },
    });
    const resJson = await res.json();
    console.log(resJson);
    return {
      originalFilename: fileName,
      size: fileSize,
      fileName: resJson.fileName,
      filePath: resJson.filePath,
    };
  }
}
