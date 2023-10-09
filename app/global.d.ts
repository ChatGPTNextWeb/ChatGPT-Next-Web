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

declare interface Window {
  __TAURI__?: {
    writeText(text: string): Promise<void>;
    invoke(command: string, payload?: Record<string, unknown>): Promise<any>;
    dialog: {
      save(options?: Record<string, unknown>): Promise<string | null>;
      open(options?: OpenDialogOptions): Promise<null | string | string[]>;
      // support locale language
      message(message: string, options?: string | MessageDialogOptions): Promise<void>;
      ask(message: string, options?: string | ConfirmDialogOptions): Promise<boolean>;
    };
    fs: {
      writeBinaryFile(path: string, data: Uint8Array): Promise<void>;
    };
    notification:{
      requestPermission(): Promise<Permission>;
      isPermissionGranted(): Promise<boolean>;
      sendNotification(options: string | Options): void;
    };
    updater: {
      checkUpdate(): Promise<UpdateResult>;
      installUpdate(): Promise<void>;
      onUpdaterEvent(handler: (status: UpdateStatusResult) => void): Promise<UnlistenFn>;
    };
    // can do route in client app like CORS fetch, currently is not enabled yet only module added.
    http: {
      fetch<T>(url: string, options?: FetchOptions): Promise<Response<T>>;
      getClient(options?: ClientOptions): Promise<Client>
    };
  };
}
