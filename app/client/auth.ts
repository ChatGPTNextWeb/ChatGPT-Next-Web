"use client";

import { parse } from "cookie";
export const useJWTCookieAuthCheck = () => {
  if (!document?.cookie) return false;
  const cookies = parse(document.cookie);
  if (!cookies.CF_Authorization) {
    gotoLogin()
  }
};

export const gotoLogin = () => {
  location.href = "/api/config";
};
