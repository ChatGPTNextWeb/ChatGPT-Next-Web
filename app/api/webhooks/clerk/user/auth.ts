import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { NextRequest } from "next/server";

export default async function verifyWebhook(req: NextRequest) {
  const payload = await req.text();

  const secret = process.env.CLERK_WEBHOOK_SECRET;

  const headers = req.headers;

  const webhookHeaders = {
    "webhook-id": getHeaderValue(headers, "svix-id"),
    "webhook-timestamp": getHeaderValue(headers, "svix-timestamp"),
    "webhook-signature": getHeaderValue(headers, "svix-signature"),
  };

  const wh = new Webhook(secret);

  const msg = wh.verify(payload, webhookHeaders);

  return msg as WebhookEvent;
}

const getHeaderValue = (headers: Headers, headerName: string) => {
  const headerValue = headers.get(headerName);

  if (!headerValue) {
    return "";
  }

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
};
