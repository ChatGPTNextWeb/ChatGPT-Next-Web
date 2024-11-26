import SHA256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Hex from "crypto-js/enc-hex";
import Utf8 from "crypto-js/enc-utf8";
import { AES, enc } from "crypto-js";

// Types and Interfaces
export interface BedrockCredentials {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface BedrockRequestConfig {
  modelId: string;
  shouldStream: boolean;
  body: any;
  credentials: BedrockCredentials;
}

export interface ModelValidationConfig {
  requiredFields: string[];
  optionalFields?: string[];
  customValidation?: (body: any) => string | null;
}

// Encryption utilities
export function encrypt(data: string, encryptionKey: string): string {
  if (!data) return "";
  if (!encryptionKey) {
    throw new Error("Encryption key is required for AWS credential encryption");
  }
  try {
    return AES.encrypt(data, encryptionKey).toString();
  } catch (error) {
    throw new Error("Failed to encrypt AWS credentials");
  }
}

export function decrypt(encryptedData: string, encryptionKey: string): string {
  if (!encryptedData) return "";
  if (!encryptionKey) {
    throw new Error("Encryption key is required for AWS credential decryption");
  }
  try {
    const bytes = AES.decrypt(encryptedData, encryptionKey);
    const decrypted = bytes.toString(enc.Utf8);
    if (!decrypted && encryptedData) {
      throw new Error("Failed to decrypt AWS credentials");
    }
    return decrypted;
  } catch (error) {
    throw new Error("Failed to decrypt AWS credentials");
  }
}

export function maskSensitiveValue(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return value;
  return "*".repeat(value.length - 4) + value.slice(-4);
}

// AWS Signing
export interface SignParams {
  method: string;
  url: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  body: string;
  service: string;
  isStreaming?: boolean;
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
}: SignParams): Promise<Record<string, string>> {
  try {
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

    const signingKey = getSigningKey(
      secretAccessKey,
      dateStamp,
      region,
      service,
    );
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
  } catch (error) {
    console.error("[AWS Signing Error]:", error);
    throw new Error("Failed to sign AWS request");
  }
}

// Bedrock utilities
export function parseEventData(chunk: Uint8Array): any {
  const decoder = new TextDecoder();
  const text = decoder.decode(chunk);

  try {
    const parsed = JSON.parse(text);
    // AWS Bedrock wraps the response in a 'body' field
    if (typeof parsed.body === "string") {
      try {
        return JSON.parse(parsed.body);
      } catch (e) {
        return { output: parsed.body };
      }
    }
    return parsed.body || parsed;
  } catch (e) {
    try {
      // Handle base64 encoded responses
      const base64Match = text.match(/:"([A-Za-z0-9+/=]+)"/);
      if (base64Match) {
        const decoded = Buffer.from(base64Match[1], "base64").toString("utf-8");
        try {
          return JSON.parse(decoded);
        } catch (e) {
          return { output: decoded };
        }
      }

      // Handle event-type responses
      const eventMatch = text.match(/:event-type[^\{]+({.*})/);
      if (eventMatch) {
        try {
          return JSON.parse(eventMatch[1]);
        } catch (e) {
          return { output: eventMatch[1] };
        }
      }

      // Handle plain text responses
      if (text.trim()) {
        const cleanText = text.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
        return { output: cleanText };
      }
    } catch (innerError) {
      console.error("[AWS Parse Error] Inner parsing failed:", innerError);
    }
  }
  return null;
}

export function getBedrockEndpoint(
  region: string,
  modelId: string,
  shouldStream: boolean,
): string {
  if (!region || !modelId) {
    throw new Error("Region and model ID are required for Bedrock endpoint");
  }
  const baseEndpoint = `https://bedrock-runtime.${region}.amazonaws.com`;
  const endpoint =
    shouldStream === false
      ? `${baseEndpoint}/model/${modelId}/invoke`
      : `${baseEndpoint}/model/${modelId}/invoke-with-response-stream`;
  return endpoint;
}

export function extractMessage(res: any, modelId: string = ""): string {
  if (!res) {
    console.error("[AWS Extract Error] extractMessage Empty response");
    return "";
  }

  // Handle Mistral model response format
  if (modelId.toLowerCase().includes("mistral")) {
    if (res.choices?.[0]?.message?.content) {
      return res.choices[0].message.content;
    }
    return res.output || "";
  }

  // Handle Llama model response format
  if (modelId.toLowerCase().includes("llama")) {
    return res?.generation || "";
  }

  // Handle Titan model response format
  if (modelId.toLowerCase().includes("titan")) {
    return res?.outputText || "";
  }

  // Handle Claude and other models
  return res?.content?.[0]?.text || "";
}

export async function* transformBedrockStream(
  stream: ReadableStream,
  modelId: string,
) {
  const reader = stream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const parsed = parseEventData(value);
      if (!parsed) continue;

      // console.log("parseEventData=========================");
      // console.log(parsed);
      // Handle Claude 3 models
      if (modelId.startsWith("anthropic.claude")) {
        if (parsed.type === "message_start") {
          // Initialize message
          continue;
        } else if (parsed.type === "content_block_start") {
          if (parsed.content_block?.type === "tool_use") {
            yield `data: ${JSON.stringify(parsed)}\n\n`;
          }
          continue;
        } else if (parsed.type === "content_block_delta") {
          if (parsed.delta?.type === "text_delta") {
            yield `data: ${JSON.stringify({
              delta: { text: parsed.delta.text },
            })}\n\n`;
          } else if (parsed.delta?.type === "input_json_delta") {
            yield `data: ${JSON.stringify(parsed)}\n\n`;
          }
        } else if (parsed.type === "content_block_stop") {
          yield `data: ${JSON.stringify(parsed)}\n\n`;
        } else if (
          parsed.type === "message_delta" &&
          parsed.delta?.stop_reason
        ) {
          yield `data: ${JSON.stringify({
            delta: { stop_reason: parsed.delta.stop_reason },
          })}\n\n`;
        }
      }
      // Handle Mistral models
      else if (modelId.toLowerCase().includes("mistral")) {
        if (parsed.choices?.[0]?.message?.tool_calls) {
          const toolCalls = parsed.choices[0].message.tool_calls;
          for (const toolCall of toolCalls) {
            yield `data: ${JSON.stringify({
              type: "content_block_start",
              content_block: {
                type: "tool_use",
                id: toolCall.id || `tool-${Date.now()}`,
                name: toolCall.function?.name,
              },
            })}\n\n`;

            if (toolCall.function?.arguments) {
              yield `data: ${JSON.stringify({
                type: "content_block_delta",
                delta: {
                  type: "input_json_delta",
                  partial_json: toolCall.function.arguments,
                },
              })}\n\n`;
            }

            yield `data: ${JSON.stringify({
              type: "content_block_stop",
            })}\n\n`;
          }
        } else if (parsed.choices?.[0]?.message?.content) {
          yield `data: ${JSON.stringify({
            delta: { text: parsed.choices[0].message.content },
          })}\n\n`;
        }

        if (parsed.choices?.[0]?.finish_reason) {
          yield `data: ${JSON.stringify({
            delta: { stop_reason: parsed.choices[0].finish_reason },
          })}\n\n`;
        }
      }
      // Handle Llama models
      else if (modelId.toLowerCase().includes("llama")) {
        if (parsed.generation) {
          yield `data: ${JSON.stringify({
            delta: { text: parsed.generation },
          })}\n\n`;
        }
        if (parsed.stop_reason) {
          yield `data: ${JSON.stringify({
            delta: { stop_reason: parsed.stop_reason },
          })}\n\n`;
        }
      }
      // Handle Titan models
      else if (modelId.toLowerCase().includes("titan")) {
        if (parsed.outputText) {
          yield `data: ${JSON.stringify({
            delta: { text: parsed.outputText },
          })}\n\n`;
        }
        if (parsed.completionReason) {
          yield `data: ${JSON.stringify({
            delta: { stop_reason: parsed.completionReason },
          })}\n\n`;
        }
      }
      // Handle other models with basic text output
      else {
        const text = parsed.response || parsed.output || "";
        if (text) {
          yield `data: ${JSON.stringify({
            delta: { text },
          })}\n\n`;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
