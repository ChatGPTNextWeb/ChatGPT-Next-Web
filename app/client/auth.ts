"use client";

import { parse } from "cookie";
import { MouseEventHandler } from "react";
export const useJWTCookieAuthCheck = () => {
  if (!document?.cookie) return false;
  const cookies = parse(document.cookie);
  if (!cookies.CF_Authorization) {
    // gotoLogin()
  }
};

export const gotoLogin:MouseEventHandler<HTMLDivElement> = () => {
  location.href = "/api/config";
};
