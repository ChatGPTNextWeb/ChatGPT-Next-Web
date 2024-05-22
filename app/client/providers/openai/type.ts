export interface ModelList {
  object: "list";
  data: Array<{
    id: string;
    object: "model";
    created: number;
    owned_by: "system" | "openai-internal";
  }>;
}

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}
