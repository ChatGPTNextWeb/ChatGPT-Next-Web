export namespace Anthropic {
  export interface ChatRequest {
    model: string; // The model that will complete your prompt.
    prompt: string; // The prompt that you want Claude to complete.
    max_tokens_to_sample: number; // The maximum number of tokens to generate before stopping.
    stop_sequences?: string[]; // Sequences that will cause the model to stop generating completion text.
    temperature?: number; // Amount of randomness injected into the response.
    top_p?: number; // Use nucleus sampling.
    top_k?: number; // Only sample from the top K options for each subsequent token.
    metadata?: object; // An object describing metadata about the request.
    stream?: boolean; // Whether to incrementally stream the response using server-sent events.
  }

  export interface ChatResponse {
    completion: string;
    stop_reason: "stop_sequence" | "max_tokens";
    model: string;
  }

  export type ChatStreamResponse = ChatResponse & {
    stop?: string;
    log_id: string;
  };
}
