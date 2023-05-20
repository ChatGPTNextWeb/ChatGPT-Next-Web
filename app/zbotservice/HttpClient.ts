import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

class HttpClient {
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig, silent = false) {
    this.instance = axios.create(config);
  }

  get<T>(url: string, params: any) {
    console.log("HttpClient.get", url, params);
    return new Promise<T>((resolve, reject) => {
      this.instance
        .get(url, { params })
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  post<T>(url: string, params: any) {
    return new Promise<T>((resolve, reject) => {
      this.instance
        .post(url, params)
        .then((response) => {
          resolve(response?.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default HttpClient;
