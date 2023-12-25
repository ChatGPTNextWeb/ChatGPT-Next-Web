import { getHeaders } from "../api";

export class FileApi {
  async upload(file: any): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);
    var headers = getHeaders();
    var res = await fetch("/api/file/upload", {
      method: "POST",
      body: formData,
      headers: {
        ...headers,
      },
    });
    const resJson = await res.json();
    console.log(resJson);
    return resJson.fileName;
  }
}
