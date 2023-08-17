import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

class HttpClient {
  instance: AxiosInstance;
  serviceAddress: string;

  constructor(config: AxiosRequestConfig, serviceAddress: string) {
    this.instance = axios.create(config);
    this.serviceAddress = serviceAddress;
  }

  get<T>(url: string, params: any) {
    return new Promise<T>((resolve, reject) => {
      this.instance
        .get(this.serviceAddress + url, { params })
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
        .post(this.serviceAddress + url, params)
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
