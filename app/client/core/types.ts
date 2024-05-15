import { RequestMessage } from "../api";

// ===================================== LLM Types start ======================================

export interface ModelConfig {
  temperature: number;
  top_p: number;
  presence_penalty: number;
  frequency_penalty: number;
  max_tokens: number;
}

export type Model = {
  name: string; // id of model in a provider
  displayName: string;
  isVisionModel?: boolean;
  isDefaultActive: boolean; // model is initialized to be active
  isDefaultSelected?: boolean; // model is initialized to be as default used model
  providerTemplateName: string;
};

// ===================================== LLM Types end ======================================

// ===================================== Chat Request Types start ======================================

export interface ChatRequestPayload<SettingKeys extends string = ""> {
  messages: RequestMessage[];
  providerConfig: Record<SettingKeys, string>;
  context: {
    isApp: boolean;
  };
}

export interface StandChatRequestPayload<SettingKeys extends string = "">
  extends ChatRequestPayload<SettingKeys> {
  modelConfig: ModelConfig;
  model: string;
}

export interface InternalChatRequestPayload<SettingKeys extends string = "">
  extends StandChatRequestPayload<SettingKeys> {
  isVisionModel: Model["isVisionModel"];
  stream: boolean;
}

export interface ProviderRequestPayload {
  headers: Record<string, string>;
  body: string;
  url: string;
  method: string;
}

export interface ChatHandlers {
  onProgress: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError: (err: Error) => void;
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
  | NumberRange[];

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
export interface IProviderTemplate<
  SettingKeys extends string,
  NAME extends string,
  Meta extends Record<string, any>,
> {
  readonly name: NAME;

  readonly metas: Meta;

  readonly providerMeta: {
    displayName: string;
    settingItems: SettingItem<SettingKeys>[];
  };
  readonly models: Model[];

  // formatChatPayload(payload: InternalChatRequestPayload<SettingKeys>): ProviderRequestPayload;

  // readWholeMessageResponseBody(res: WholeMessageResponseBody): StandChatReponseMessage;

  streamChat(
    payload: InternalChatRequestPayload<SettingKeys>,
    onProgress?: (message: string, chunk: string) => void,
    onFinish?: (message: string) => void,
    onError?: (err: Error) => void,
  ): AbortController;

  chat(
    payload: InternalChatRequestPayload<SettingKeys>,
  ): Promise<StandChatReponseMessage>;
}

export interface Serializable<Snapshot> {
  serialize(): Snapshot;
}
