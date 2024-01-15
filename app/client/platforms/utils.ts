import { getHeaders } from "../api";

export class FileApi {
  async upload(file: any): Promise<any> {
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
      fileName: resJson.fileName,
      filePath: resJson.filePath,
    };
  }
}
