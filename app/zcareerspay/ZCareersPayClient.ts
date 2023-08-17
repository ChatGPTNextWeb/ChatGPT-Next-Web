import HttpClient from "../zbotservice/HttpClient";
import { getServerSideConfig } from "../config/server";

export type UserPayVO = {
  email: string;
  amount: number;
  base_coins: number;
  mode: number;
  notes?: string;
};

export type UserPayResponseVO = {
  code_url: string;
  order_id: number;
};

class ZCareersPayClient {
  client: HttpClient;

  constructor() {
    const serviceAddress = getServerSideConfig().zCareersPayUrl;
    this.client = new HttpClient({}, serviceAddress as string);
  }

  getOrderStatus(order_id: string) {
    return this.client.post<string>(`/check_order`, { order_id: order_id });
  }

  pay(userPayVO: UserPayVO) {
    return this.client.post<UserPayResponseVO>(`/pay`, userPayVO);
  }
}

export const zCareersPayClient = new ZCareersPayClient();

export const QrCodeAdress = "https://api.qrserver.com/v1/create-qr-code/";
