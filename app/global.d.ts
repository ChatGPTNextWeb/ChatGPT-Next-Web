declare module "*.jpg";
declare module "*.png";
declare module "*.woff2";
declare module "*.woff";
declare module "*.ttf";
declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg";

// Add more specific types
interface TauriCommands {
  writeText(text: string): Promise<void>;
  invoke(command: string, payload?: Record<string, unknown>): Promise<any>;
}

interface TauriDialog {
  save(options?: Record<string, unknown>): Promise<string | null>;
}

interface TauriFS {
  writeBinaryFile(path: string, data: Uint8Array): Promise<void>;
  writeTextFile(path: string, data: string): Promise<void>;
}

interface TauriNotification {
  requestPermission(): Promise<Permission>;
  isPermissionGranted(): Promise<boolean>;
  sendNotification(options: string | Options): void;
}

declare global {
  interface Window {
    __TAURI__?: {
      dialog: TauriDialog;
      fs: TauriFS;
      notification: TauriNotification;
      // ... other Tauri interfaces
    };
  }
}
