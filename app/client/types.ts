import { DEFAULT_MODELS } from "../constant";

export interface LLMUsage {
  used: number;
  total: number;
  available: boolean;
}

export interface LLMModel {
  name: string;
  available: boolean;
}

export const ROLES = ["system", "user", "assistant"] as const;
export type MessageRole = (typeof ROLES)[number];

export type ChatModel = (typeof DEFAULT_MODELS)[number]["name"];

export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export interface ChatOptions {
  messages: RequestMessage[];
  shouldSummarize?: boolean;

  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export type LLMClient = {
  chat(options: ChatOptions): Promise<void>;
  chatStream(options: ChatOptions): Promise<void>;
  usage(): Promise<LLMUsage>;
  models(): Promise<LLMModel[]>;
};
