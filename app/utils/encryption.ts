import { AES, enc } from "crypto-js";

const SECRET_KEY = "your-secret-key"; // Replace this with a secure, randomly generated key

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
