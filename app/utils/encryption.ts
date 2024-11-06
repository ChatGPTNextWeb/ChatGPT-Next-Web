import { AES, enc } from "crypto-js";

const SECRET_KEY =
  process.env.ENCRYPTION_KEY ||
  "your-secret-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace this with a secure, randomly generated key
if (!SECRET_KEY || SECRET_KEY.length < 32) {
  throw new Error(
    "ENCRYPTION_KEY environment variable must be set with at least 32 characters",
  );
}

export function encrypt(data: string): string {
  try {
    return AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    return data; // Fallback to unencrypted data if encryption fails
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const bytes = AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return encryptedData; // Fallback to the original data if decryption fails
  }
}

export function maskSensitiveValue(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return value;
  return "*".repeat(value.length - 4) + value.slice(-4);
}
