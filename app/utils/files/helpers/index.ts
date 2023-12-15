import { EXTENSION_PREFIX } from "./constants";

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });
};

export const saveToLocalStorage = (key: string, value: string): void => {
  const prefixedValue = `${EXTENSION_PREFIX}_${key}`;
  localStorage.setItem(prefixedValue, value);
};

export const getFromLocalStorage = (key: string) => {
  const prefixedKey = `${EXTENSION_PREFIX}_${key}`;
  return localStorage.getItem(prefixedKey);
};

export const removeItemFromLocalStorage = (key: string) => {
  const prefixedKey = `${EXTENSION_PREFIX}_${key}`;
  localStorage.removeItem(prefixedKey);
};

export const dataURLToBlob = (dataURL: string) => {
  const [meta, base64] = dataURL.split(",");
  const [mimeType] = meta.split(";")[0].split(":");
  const binary = atob(base64);
  const length = binary.length;
  const buffer = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    buffer[i] = binary.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeType });
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
