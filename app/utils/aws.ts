import SHA256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { AES, enc } from "crypto-js";
import { getServerSideConfig } from "../config/server";

const serverConfig = getServerSideConfig();
const SECRET_KEY = serverConfig.bedrockEncryptionKey || "";
if (serverConfig.isBedrock && !SECRET_KEY) {
  console.error("When use Bedrock modle,ENCRYPTION_KEY should been set!");
}

export function encrypt(data: string): string {
  if (!data) return "";
  try {
    return AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return "";
  }
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";
  try {
    const bytes = AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(enc.Utf8);
    if (!decrypted && encryptedData) {
      return encryptedData;
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

export function maskSensitiveValue(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return value;
  return "*".repeat(value.length - 4) + value.slice(-4);
}

export interface SignParams {
  method: string;
  url: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  body: string;
  service: string;
  isStreaming?: boolean;
  additionalHeaders?: Record<string, string>;
}

function hmac(
  key: string | CryptoJS.lib.WordArray,
  data: string,
): CryptoJS.lib.WordArray {
  if (typeof key === "string") {
    key = Utf8.parse(key);
  }
  return HmacSHA256(data, key);
}

function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
): CryptoJS.lib.WordArray {
  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  return kSigning;
}

function normalizeHeaderValue(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function encodeURIComponent_RFC3986(str: string): string {
  return encodeURIComponent(str)
    .replace(
      /[!'()*]/g,
      (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase(),
    )
    .replace(/[-_.~]/g, (c) => c);
}

function encodeURI_RFC3986(uri: string): string {
  if (!uri || uri === "/") return "";

  const segments = uri.split("/");

  return segments
    .map((segment) => {
      if (!segment) return "";

      if (segment.includes("model/")) {
        const parts = segment.split(/(model\/)/);
        return parts
          .map((part) => {
            if (part === "model/") return part;
            if (part.includes(".") || part.includes(":")) {
              return part
                .split(/([.:])/g)
                .map((subpart, i) => {
                  if (i % 2 === 1) return subpart;
                  return encodeURIComponent_RFC3986(subpart);
                })
                .join("");
            }
            return encodeURIComponent_RFC3986(part);
          })
          .join("");
      }

      if (segment === "invoke-with-response-stream") {
        return segment;
      }

      return encodeURIComponent_RFC3986(segment);
    })
    .join("/");
}

export async function sign({
  method,
  url,
  region,
  accessKeyId,
  secretAccessKey,
  body,
  service,
  isStreaming = true,
  additionalHeaders = {},
}: SignParams): Promise<Record<string, string>> {
  const endpoint = new URL(url);
  const canonicalUri = "/" + encodeURI_RFC3986(endpoint.pathname.slice(1));
  const canonicalQueryString = endpoint.search.slice(1);

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payloadHash = SHA256(body).toString(Hex);

  const headers: Record<string, string> = {
    accept: isStreaming
      ? "application/vnd.amazon.eventstream"
      : "application/json",
    "content-type": "application/json",
    host: endpoint.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    ...additionalHeaders,
  };

  if (isStreaming) {
    headers["x-amzn-bedrock-accept"] = "*/*";
  }

  const sortedHeaderKeys = Object.keys(headers).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  const canonicalHeaders = sortedHeaderKeys
    .map(
      (key) => `${key.toLowerCase()}:${normalizeHeaderValue(headers[key])}\n`,
    )
    .join("");

  const signedHeaders = sortedHeaderKeys
    .map((key) => key.toLowerCase())
    .join(";");

  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    SHA256(canonicalRequest).toString(Hex),
  ].join("\n");

  const signingKey = getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = hmac(signingKey, stringToSign).toString(Hex);

  const authorization = [
    `${algorithm} Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return {
    ...headers,
    Authorization: authorization,
  };
}
