import SHA256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { AES, enc } from "crypto-js";

const SECRET_KEY =
  process.env.ENCRYPTION_KEY ||
  "your-secret-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
if (!SECRET_KEY || SECRET_KEY.length < 32) {
  throw new Error(
    "ENCRYPTION_KEY environment variable must be set with at least 32 characters",
  );
}

export function encrypt(data: string): string {
  if (!data) return "";
  try {
    return AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return data;
  }
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";
  try {
    // Try to decrypt
    const bytes = AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(enc.Utf8);

    // If decryption results in empty string but input wasn't empty,
    // the input might already be decrypted
    if (!decrypted && encryptedData) {
      return encryptedData;
    }
    return decrypted;
  } catch (error) {
    // If decryption fails, the input might already be decrypted
    return encryptedData;
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
  sessionToken?: string;
  body: string;
  service: string;
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
    .replace(/[-_.~]/g, (c) => c); // RFC 3986 unreserved characters
}

function encodeURI_RFC3986(uri: string): string {
  // Handle empty or root path
  if (!uri || uri === "/") return "";

  // Split the path into segments, preserving empty segments for double slashes
  const segments = uri.split("/");

  return segments
    .map((segment) => {
      if (!segment) return "";

      // Special handling for Bedrock model paths
      if (segment.includes("model/")) {
        const parts = segment.split(/(model\/)/);
        return parts
          .map((part) => {
            if (part === "model/") return part;
            // Handle the model identifier part
            if (part.includes(".") || part.includes(":")) {
              return part
                .split(/([.:])/g)
                .map((subpart, i) => {
                  if (i % 2 === 1) return subpart; // Don't encode separators
                  return encodeURIComponent_RFC3986(subpart);
                })
                .join("");
            }
            return encodeURIComponent_RFC3986(part);
          })
          .join("");
      }

      // Handle invoke-with-response-stream without encoding
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
  sessionToken,
  body,
  service,
}: SignParams): Promise<Record<string, string>> {
  const endpoint = new URL(url);
  const canonicalUri = "/" + encodeURI_RFC3986(endpoint.pathname.slice(1));
  const canonicalQueryString = endpoint.search.slice(1); // Remove leading '?'

  // Create a date stamp and time stamp in ISO8601 format
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // Calculate the hash of the payload
  const payloadHash = SHA256(body).toString(Hex);

  // Define headers with normalized values
  const headers: Record<string, string> = {
    accept: "application/vnd.amazon.eventstream",
    "content-type": "application/json",
    host: endpoint.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "x-amzn-bedrock-accept": "*/*",
  };

  // Add session token if present
  if (sessionToken) {
    headers["x-amz-security-token"] = sessionToken;
  }

  // Get sorted header keys (case-insensitive)
  const sortedHeaderKeys = Object.keys(headers).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );

  // Create canonical headers string with normalized values
  const canonicalHeaders = sortedHeaderKeys
    .map(
      (key) => `${key.toLowerCase()}:${normalizeHeaderValue(headers[key])}\n`,
    )
    .join("");

  // Create signed headers string
  const signedHeaders = sortedHeaderKeys
    .map((key) => key.toLowerCase())
    .join(";");

  // Create canonical request
  const canonicalRequest = [
    method.toUpperCase(),
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // Create the string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    SHA256(canonicalRequest).toString(Hex),
  ].join("\n");

  // Calculate the signature
  const signingKey = getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = hmac(signingKey, stringToSign).toString(Hex);

  // Create the authorization header
  const authorization = [
    `${algorithm} Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  // Return headers with proper casing for the request
  return {
    Accept: headers.accept,
    "Content-Type": headers["content-type"],
    Host: headers.host,
    "X-Amz-Content-Sha256": headers["x-amz-content-sha256"],
    "X-Amz-Date": headers["x-amz-date"],
    "X-Amzn-Bedrock-Accept": headers["x-amzn-bedrock-accept"],
    ...(sessionToken && { "X-Amz-Security-Token": sessionToken }),
    Authorization: authorization,
  };
}
