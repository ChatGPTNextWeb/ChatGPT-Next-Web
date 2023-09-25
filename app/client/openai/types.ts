export namespace OpenAI {
  export type Role = "system" | "user" | "assistant" | "function";
  export type FinishReason = "stop" | "length" | "function_call";

  export interface Message {
    role: Role;
    content?: string;
    function_call?: {
      name: string;
      arguments: string;
    };
  }

  export interface Function {
    name: string;
    description?: string;
    parameters: object;
  }

  export interface ListModelResponse {
    object: string;
    data: Array<{
      id: string;
      object: string;
      root: string;
    }>;
  }

  export interface ChatCompletionChoice {
    index: number;
    message: Message;
    finish_reason: FinishReason;
  }

  export interface ChatCompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  }

  export interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: ChatCompletionChoice[];
    usage: ChatCompletionUsage;
  }

  export interface ChatCompletionChunkChoice {
    index: number;
    delta: Message;
    finish_reason?: FinishReason;
  }

  export interface ChatCompletionStreamResponse {
    object: string;
    created: number;
    model: string;
    choices: ChatCompletionChunkChoice[];
  }

  export interface ChatCompletionRequest {
    model: string;
    messages: Message[];

    functions?: Function[];
    function_call?: "none" | "auto";

    temperature?: number;
    top_p?: number;
    n?: number;
    stream?: boolean;
    stop?: string | string[];
    max_tokens?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  }
}
