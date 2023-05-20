import HttpClient from "./HttpClient";
import { getServerSideConfig } from "../config/server";

const serverConfig = getServerSideConfig();

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

type UserInfo = {
  id: number;
  name: string;
  password: string;
  phone: string;
  occupation: string;
  createTime: Date;
};

class ZBotServiceClient {
  client: HttpClient;

  // TODO: this is not successful, need to figure out how to get the value from .env file
  serviceUrl = serverConfig.zBotServiceUrl;

  constructor(silent = false) {
    this.client = new HttpClient({}, silent);
  }

  getHealth() {
    return this.client.get<boolean>(`${this.serviceUrl}/health/get`, {});
  }

  async getHealthAsync() {
    return await this.client.get<boolean>(`${this.serviceUrl}/health/get`, {});
  }

  getWeather() {
    return this.client.get<WeatherForecast[]>(
      `${this.serviceUrl}/WeatherForecast/GetWeatherForecast`,
      {},
    );
  }

  async getWeatherAsync() {
    return await this.client.get<WeatherForecast[]>(
      `${this.serviceUrl}/WeatherForecast/GetWeatherForecast`,
      {},
    );
  }

  getUserInfo(id: number) {
    return this.client.get<UserInfo>(`${this.serviceUrl}/userInfo/${id}`, {});
  }
}

// export type {UserInfo}

const zBotServiceClient = new ZBotServiceClient();
export default zBotServiceClient;
