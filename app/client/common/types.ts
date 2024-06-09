import { RequestMessage } from "../api";
import { getServerSideConfig } from "@/app/config/server";
import { NextRequest, NextResponse } from "next/server";

export { type RequestMessage };

// ===================================== LLM Types start ======================================

export interface ModelConfig {
  temperature: number;
  top_p: number;
  presence_penalty: number;
  frequency_penalty: number;
  max_tokens: number;
}

export interface ModelSettings extends Omit<ModelConfig, "max_tokens"> {
  global_max_tokens: number;
}

export type ModelTemplate = {
  name: string; // id of model in a provider
  displayName: string;
  isVisionModel?: boolean;
  isDefaultActive: boolean; // model is initialized to be active
  isDefaultSelected?: boolean; // model is initialized to be as default used model
  max_tokens?: number;
};

export interface Model extends Omit<ModelTemplate, "isDefaultActive"> {
  providerTemplateName: string;
  isActive: boolean;
  providerName: string;
  available: boolean;
  customized: boolean; // Only customized model is allowed to be modified
}

export interface ModelInfo extends Pick<ModelTemplate, "name"> {
  [k: string]: any;
}

// ===================================== LLM Types end ======================================

// ===================================== Chat Request Types start ======================================

export interface ChatRequestPayload {
  messages: RequestMessage[];
  context: {
    isApp: boolean;
  };
}

export interface StandChatRequestPayload extends ChatRequestPayload {
  modelConfig: ModelConfig;
  model: string;
}

export interface InternalChatRequestPayload<SettingKeys extends string = "">
  extends StandChatRequestPayload {
  providerConfig: Partial<Record<SettingKeys, string>>;
  isVisionModel: Model["isVisionModel"];
  stream: boolean;
}

export interface ProviderRequestPayload {
  headers: Record<string, string>;
  body: string;
  url: string;
  method: string;
}

export interface InternalChatHandlers {
  onProgress: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError: (err: Error) => void;
}

export interface ChatHandlers extends InternalChatHandlers {
  onProgress: (chunk: string) => void;
  onFinish: () => void;
  onFlash: (message: string) => void;
}

// ===================================== Chat Request Types end ======================================

// ===================================== Chat Response Types start ======================================

export interface StandChatReponseMessage {
  message: string;
}

// ===================================== Chat Request Types end ======================================

// ===================================== Provider Settings Types start ======================================

type NumberRange = [number, number];

export type Validator =
  | "required"
  | "number"
  | "string"
  | NumberRange
  | NumberRange[]
  | ((v: any) => Promise<string | void>);

export type CommonSettingItem<SettingKeys extends string> = {
  name: SettingKeys;
  title?: string;
  description?: string;
  validators?: Validator[];
};

export type InputSettingItem = {
  type: "input";
  placeholder?: string;
} & (
  | {
      inputType?: "password" | "normal";
      defaultValue?: string;
    }
  | {
      inputType?: "number";
      defaultValue?: number;
    }
);

export type SelectSettingItem = {
  type: "select";
  options: {
    name: string;
    value: "number" | "string" | "boolean";
  }[];
  placeholder?: string;
};

export type RangeSettingItem = {
  type: "range";
  range: NumberRange;
};

export type SwitchSettingItem = {
  type: "switch";
};

export type SettingItem<SettingKeys extends string = ""> =
  CommonSettingItem<SettingKeys> &
    (
      | InputSettingItem
      | SelectSettingItem
      | RangeSettingItem
      | SwitchSettingItem
    );

// ===================================== Provider Settings Types end ======================================

// ===================================== Provider Template Types start ======================================

export type ServerConfig = ReturnType<typeof getServerSideConfig>;

export interface IProviderTemplate<
  SettingKeys extends string,
  NAME extends string,
  Meta extends Record<string, any>,
> {
  readonly name: NAME;

  readonly apiRouteRootName: `/api/provider/${NAME}`;

  readonly allowedApiMethods: Array<
    "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS"
  >;

  readonly metas: Meta;

  readonly providerMeta: {
    displayName: string;
    settingItems: SettingItem<SettingKeys>[];
  };
  readonly defaultModels: ModelTemplate[];

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    handlers: ChatHandlers,
    fetch: typeof window.fetch,
  ): AbortController;

  chat(
    payload: InternalChatRequestPayload<SettingKeys>,
    fetch: typeof window.fetch,
  ): Promise<StandChatReponseMessage>;

  getAvailableModels?(
    providerConfig: InternalChatRequestPayload<SettingKeys>["providerConfig"],
  ): Promise<ModelInfo[]>;

  readonly runtime: "edge";
  readonly preferredRegion: "auto" | "global" | "home" | string | string[];

  serverSideRequestHandler(
    req: NextRequest & {
      subpath: string;
    },
    serverConfig: ServerConfig,
  ): Promise<NextResponse>;
}

export type ProviderTemplate = IProviderTemplate<any, any, any>;

export interface Serializable<Snapshot> {
  serialize(): Snapshot;
}
