import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { getServerSideConfig } from "../config/server";

const serviceAddress = getServerSideConfig().zBotServiceUrl;

class HttpClient {
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig, silent = false) {
    this.instance = axios.create(config);
  }

  get<T>(url: string, params: any) {
    return new Promise<T>((resolve, reject) => {
      this.instance
        .get(serviceAddress + url, { params })
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
        .post(serviceAddress + url, params)
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
