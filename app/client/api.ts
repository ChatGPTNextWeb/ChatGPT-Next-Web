import { fetchEventSource } from "@microsoft/fetch-event-source";
import { ACCESS_CODE_PREFIX } from "../constant";
import { ModelType, useAccessStore } from "../store";
import { ChatGPTApi } from "./platforms/openai";

export enum MessageRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
}

export const Models = ["gpt-3.5-turbo", "gpt-4"] as const;
export type ChatModel = ModelType;

export interface Message {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  temperature?: number;
  topP?: number;
  stream?: boolean;
  presencePenalty?: number;
  frequencyPenalty?: number;
}

export interface ChatOptions {
  messages: Message[];
  model: ChatModel;
  config: LLMConfig;

  onUpdate: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError: (err: Error) => void;
  onUnAuth: () => void;
}

export interface LLMUsage {
  used: number;
  total: number;
}

export abstract class LLMApi {
  abstract chat(options: ChatOptions): Promise<void>;
  abstract usage(): Promise<LLMUsage>;
}

export class ClientApi {
  public llm: LLMApi;

  constructor() {
    this.llm = new ChatGPTApi();
  }

  headers() {
    const accessStore = useAccessStore.getState();
    let headers: Record<string, string> = {};

    const makeBearer = (token: string) => `Bearer ${token.trim()}`;
    const validString = (x: string) => x && x.length > 0;

    // use user's api key first
    if (validString(accessStore.token)) {
      headers.Authorization = makeBearer(accessStore.token);
    } else if (
      accessStore.enabledAccessControl() &&
      validString(accessStore.accessCode)
    ) {
      headers.Authorization = makeBearer(
        ACCESS_CODE_PREFIX + accessStore.accessCode,
      );
    }

    return headers;
  }

  config() {}

  prompts() {}

  masks() {}
}

export const api = new ClientApi();

export function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const makeBearer = (token: string) => `Bearer ${token.trim()}`;
  const validString = (x: string) => x && x.length > 0;

  // use user's api key first
  if (validString(accessStore.token)) {
    headers.Authorization = makeBearer(accessStore.token);
  } else if (
    accessStore.enabledAccessControl() &&
    validString(accessStore.accessCode)
  ) {
    headers.Authorization = makeBearer(
      ACCESS_CODE_PREFIX + accessStore.accessCode,
    );
  }

  return headers;
}
