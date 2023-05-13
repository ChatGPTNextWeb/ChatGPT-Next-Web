import type {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateImageRequestSizeEnum,
} from "openai";

export type ChatRequest = CreateChatCompletionRequest;
export type ChatResponse = CreateChatCompletionResponse;
export type ImageRequestSizeEnum = CreateImageRequestSizeEnum;
export type Updater<T> = (updater: (value: T) => void) => void;
