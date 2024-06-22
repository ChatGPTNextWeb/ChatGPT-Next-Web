export const OWNER = "InvisibilityInc";
export const REPO = "nextweb";
export const DISCORD_URL = "https://discord.i.inc/";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";

export const DEFAULT_API_HOST = "https://cloak.i.inc";
export const OPENAI_BASE_URL = "https://api.openai.com";
export const ANTHROPIC_BASE_URL = "https://api.anthropic.com";

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/";

export enum Path {
  Home = "/",
  Chat = "/chat",
  Settings = "/settings",
  NewChat = "/new-chat",
  Masks = "/masks",
  Auth = "/auth",
  LoginDev = "https://authkit.i.inc/?redirect_uri=https%3A%2F%2Fcloak.i.inc%2Fauth%2Fworkos%2Fcallback_nextweb_dev",
  Login = "https://authkit.i.inc/?redirect_uri=https%3A%2F%2Fcloak.i.inc%2Fauth%2Fworkos%2Fcallback_nextweb",
}

export enum ApiPath {
  Cors = "",
  OpenAI = "/oai",
  Anthropic = "/oai",
}

export enum SlotID {
  AppBody = "app-body",
  CustomModel = "custom-model",
}

export enum FileName {
  Masks = "masks.json",
  Prompts = "prompts.json",
}

export enum StoreKey {
  Chat = "chat-next-web-store",
  Access = "access-control",
  Config = "app-config",
  Mask = "mask-store",
  Prompt = "prompt-store",
  Update = "chat-update",
  Sync = "sync",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "chatgpt-next-web";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export enum ServiceProvider {
  OpenAI = "OpenAI",
  Azure = "Azure",
  Google = "Google",
  Anthropic = "Anthropic",
}

export enum ModelProvider {
  GPT = "GPT",
  GeminiPro = "GeminiPro",
  Claude = "Claude",
}

export const OpenaiPath = {
  ChatPath: "v1/chat/completions",
  UsagePath: "dashboard/billing/usage",
  SubsPath: "dashboard/billing/subscription",
  ListModelPath: "v1/models",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang
// export const DEFAULT_SYSTEM_TEMPLATE = `
// You are ChatGPT, a large language model trained by {{ServiceProvider}}.
// Knowledge cutoff: {{cutoff}}
// Current model: {{model}}
// Current time: {{time}}
// Latex inline: $x^2$
// Latex block: $$e=mc^2$$
// `;
export const DEFAULT_SYSTEM_TEMPLATE = `
You are ChatGPT, a large language model trained by {{ServiceProvider}}.
Knowledge cutoff: {{cutoff}}
Current model: {{model}}
Current time: {{time}}
Latex inline: \\(x^2\\) 
Latex block: $$e=mc^2$$
`;

export const SUMMARIZE_MODEL = "gpt-3.5-turbo";
export const GEMINI_SUMMARIZE_MODEL = "gemini-pro";

export const KnowledgeCutOffDate: Record<string, string> = {
  default: "2021-09",
  "gpt-4-turbo": "2023-12",
  "gpt-4-turbo-2024-04-09": "2023-12",
  "gpt-4-turbo-preview": "2023-12",
  "gpt-4o": "2023-10",
  "gpt-4o-2024-05-13": "2023-10",
  "gpt-4-vision-preview": "2023-04",
  // After improvements,
  // it's now easier to add "KnowledgeCutOffDate" instead of stupid hardcoding it, as was done previously.
  "gemini-pro": "2023-12",
  "gemini-pro-vision": "2023-12",
};

const openaiModels = [
  {
    model_name: "gpt-3.5-turbo",
    display_name: "GPT-3.5 Turbo",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4",
    display_name: "GPT-4",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-0613",
    display_name: "GPT-4 0613",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-0314",
    display_name: "GPT-4 0613",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-0125-preview",
    display_name: "GPT-4 0125 Preview",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-turbo",
    display_name: "GPT-4 Turbo",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-turbo-preview",
    display_name: "GPT-4 Turbo Preview",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-turbo-2024-04-09",
    display_name: "GPT-4 Turbo",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-1106-preview",
    display_name: "GPT-4 1106 Preview",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4-vision-preview",
    display_name: "GPT-4 Vision Preview",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4o",
    display_name: "GPT-4o",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gpt-4o-2024-05-13",
    display_name: "GPT-4o",
    provider: {
      provider_name: "OpenAI",
      provider_id: "openai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "command",
    display_name: "Cohere Command",
    provider: {
      provider_name: "Cohere",
      provider_id: "cohere",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "command-light",
    display_name: "Cohere Command-Light",
    provider: {
      provider_name: "Cohere",
      provider_id: "cohere",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "command-nightly",
    display_name: "Cohere Command-nightly",
    provider: {
      provider_name: "Cohere",
      provider_id: "cohere",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "command-r-plus",
    display_name: "Cohere Command-R-Plus",
    provider: {
      provider_name: "Cohere",
      provider_id: "cohere",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "command-r",
    display_name: "Cohere Command-R",
    provider: {
      provider_name: "Cohere",
      provider_id: "cohere",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "palm/chat-bison",
    display_name: "PaLM chat-bision",
    provider: {
      provider_name: "Google Palm",
      provider_id: "google_palm",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gemini-pro",
    display_name: "Vertext AI gemini-pro",
    provider: {
      provider_name: "Google Vertex AI",
      provider_id: "google_vertex_ai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gemini/gemini-pro",
    display_name: "Gemini Pro",
    provider: {
      provider_name: "Google Gemini AI",
      provider_id: "google_gemini_ai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "gemini/gemini-pro-vision",
    display_name: "Gemini gemini-pro",
    provider: {
      provider_name: "Google Gemini AI",
      provider_id: "google_gemini_ai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-instant-1",
    display_name: "Claude Instant V1",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-instant-1.2",
    display_name: "Claude Instant V1.2",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-2.1",
    display_name: "Claude V2.1",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-2",
    display_name: "Claude V2",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-3-opus-20240229",
    display_name: "Claude V3 Opus",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-3-sonnet-20240229",
    display_name: "Claude V3 Sonnet",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "claude-3-haiku-20240307",
    display_name: "Claude V3 Haiku",
    provider: {
      provider_name: "Anthropic",
      provider_id: "anthropic",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "mistral/mistral-tiny",
    display_name: "Mistral-7B-v0.2",
    provider: {
      provider_name: "Mistral",
      provider_id: "mistral",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "mistral/mistral-small",
    display_name: "Mixtral-8X7B-v0.1,",
    provider: {
      provider_name: "Mistral",
      provider_id: "mistral",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "mistral/mistral-medium",
    display_name: "Mistral Medium",
    provider: {
      provider_name: "Mistral",
      provider_id: "mistral",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "mistral/mistral-large-latest",
    display_name: "Mistral Large",
    provider: {
      provider_name: "Mistral",
      provider_id: "mistral",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "azure/gpt-4",
    display_name: "Azure GPT-4",
    provider: {
      provider_name: "Azure OpenAI",
      provider_id: "azure_openai",
      moderation: "Filtered",
      credential_fields: ["api_key", "api_base", "api_version"],
    },
  },
  {
    model_name: "azure/gpt-35-turbo",
    display_name: "Azure GPT-3.5 Turbo",
    provider: {
      provider_name: "Azure OpenAI",
      provider_id: "azure_openai",
      moderation: "Filtered",
      credential_fields: ["api_key", "api_base", "api_version"],
    },
  },
  {
    model_name: "azure/gpt-4-32k",
    display_name: "Azure GPT-4 32k",
    provider: {
      provider_name: "Azure OpenAI",
      provider_id: "azure_openai",
      moderation: "Filtered",
      credential_fields: ["api_key", "api_base", "api_version"],
    },
  },
  {
    model_name: "azure/gpt-4-1106-preview",
    display_name: "Azure GPT-4 1106 Preview",
    provider: {
      provider_name: "Azure OpenAI",
      provider_id: "azure_openai",
      moderation: "Filtered",
      credential_fields: ["api_key", "api_base", "api_version"],
    },
  },
  {
    model_name: "azure/gpt-4o",
    display_name: "Azure GPT-4o",
    provider: {
      provider_name: "Azure OpenAI",
      provider_id: "azure_openai",
      moderation: "Filtered",
      credential_fields: ["api_key", "api_base", "api_version"],
    },
  },
  {
    model_name: "azure/gpt-4-vision-preview",
    display_name: "Azure GPT-4 Vision Preview",
    provider: {
      provider_name: "Azure OpenAI Vision",
      provider_id: "azure_openai_vision",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-capybara-7b:free",
    display_name: "Nous: Capybara 7B (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-7b-instruct:free",
    display_name: "Mistral 7B Instruct (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/undi95/toppy-m-7b:free",
    display_name: "Toppy M 7B (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openrouter/cinematika-7b:free",
    display_name: "Cinematika 7B (alpha) (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemma-7b-it:free",
    display_name: "Google: Gemma 7B (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/jebcarter/psyfighter-13b",
    display_name: "Psyfighter 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/koboldai/psyfighter-13b-2",
    display_name: "Psyfighter v2 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-llama2-13b",
    display_name: "Nous: Hermes 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/codellama-34b-instruct",
    display_name: "Meta: CodeLlama 34B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/phind/phind-codellama-34b",
    display_name: "Phind: CodeLlama 34B v2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/intel/neural-chat-7b",
    display_name: "Neural Chat 7B v3.1",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-2-mixtral-8x7b-dpo",
    display_name: "Nous: Hermes 2 Mixtral 8x7B DPO",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-2-mixtral-8x7b-sft",
    display_name: "Nous: Hermes 2 Mixtral 8x7B SFT",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-2-vision-7b",
    display_name: "Nous: Hermes 2 Vision 7B (alpha)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-2-13b-chat",
    display_name: "Meta: Llama v2 13B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/migtissera/synthia-70b",
    display_name: "Synthia 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/pygmalionai/mythalion-13b",
    display_name: "Pygmalion: Mythalion 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/gryphe/mythomax-l2-13b",
    display_name: "MythoMax 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/xwin-lm/xwin-lm-70b",
    display_name: "Xwin 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/alpindale/goliath-120b",
    display_name: "Goliath 120B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/neversleep/noromaid-20b",
    display_name: "Noromaid 20B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/gryphe/mythomist-7b",
    display_name: "MythoMist 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/sophosympatheia/midnight-rose-70b",
    display_name: "Midnight Rose 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/undi95/remm-slerp-l2-13b:extended",
    display_name: "ReMM SLERP 13B (extended)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/gryphe/mythomax-l2-13b:extended",
    display_name: "MythoMax 13B (extended)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mancer/weaver",
    display_name: "Mancer: Weaver (alpha)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-capybara-7b",
    display_name: "Nous: Capybara 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/codellama/codellama-70b-instruct",
    display_name: "Meta: CodeLlama 70B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/teknium/openhermes-2-mistral-7b",
    display_name: "OpenHermes 2 Mistral 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/teknium/openhermes-2.5-mistral-7b",
    display_name: "OpenHermes 2.5 Mistral 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/undi95/remm-slerp-l2-13b",
    display_name: "ReMM SLERP 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/undi95/toppy-m-7b",
    display_name: "Toppy M 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openrouter/cinematika-7b",
    display_name: "Cinematika 7B (alpha)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/01-ai/yi-34b-chat",
    display_name: "Yi 34B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/01-ai/yi-34b",
    display_name: "Yi 34B (base)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/01-ai/yi-6b",
    display_name: "Yi 6B (base)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/togethercomputer/stripedhyena-nous-7b",
    display_name: "StripedHyena Nous 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/togethercomputer/stripedhyena-hessian-7b",
    display_name: "StripedHyena Hessian 7B (base)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mixtral-8x7b",
    display_name: "Mixtral 8x7B (base)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-yi-34b",
    display_name: "Nous: Hermes 2 Yi 34B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-hermes-2-mistral-7b-dpo",
    display_name: "Nous: Hermes 2 Mistral 7B DPO",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/open-orca/mistral-7b-openorca",
    display_name: "Mistral OpenOrca 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/huggingfaceh4/zephyr-7b-beta",
    display_name: "Hugging Face: Zephyr 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-3.5-turbo",
    display_name: "OpenAI: GPT-3.5 Turbo",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-3.5-turbo-0125",
    display_name: "OpenAI: GPT-3.5 Turbo 16k",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-3.5-turbo-1106",
    display_name: "OpenAI: GPT-3.5 Turbo 16k (older v1106)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-turbo-preview",
    display_name: "OpenAI: GPT-4 Turbo",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-1106-preview",
    display_name: "OpenAI: GPT-4 Turbo (older v1106)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4",
    display_name: "OpenAI: GPT-4",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-0314",
    display_name: "OpenAI: GPT-4 (older v0314)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-32k",
    display_name: "OpenAI: GPT-4 32k",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-32k-0314",
    display_name: "OpenAI: GPT-4 32k (older v0314)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4-vision-preview",
    display_name: "OpenAI: GPT-4 Vision",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-3.5-turbo-instruct",
    display_name: "OpenAI: GPT-3.5 Turbo Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/palm-2-chat-bison",
    display_name: "Google: PaLM 2 Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/palm-2-codechat-bison",
    display_name: "Google: PaLM 2 Code Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/palm-2-chat-bison-32k",
    display_name: "Google: PaLM 2 Chat 32k",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/palm-2-codechat-bison-32k",
    display_name: "Google: PaLM 2 Code Chat 32k",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemini-pro",
    display_name: "Google: Gemini Pro 1.0",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemini-pro-vision",
    display_name: "Google: Gemini Pro Vision 1.0",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/pplx-70b-online",
    display_name: "Perplexity: PPLX 70B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/pplx-7b-online",
    display_name: "Perplexity: PPLX 7B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/pplx-7b-chat",
    display_name: "Perplexity: PPLX 7B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/pplx-70b-chat",
    display_name: "Perplexity: PPLX 70B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/sonar-small-chat",
    display_name: "Perplexity: Sonar 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/sonar-medium-chat",
    display_name: "Perplexity: Sonar 8x7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/sonar-small-online",
    display_name: "Perplexity: Sonar 7B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/sonar-medium-online",
    display_name: "Perplexity: Sonar 8x7B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-opus",
    display_name: "Anthropic: Claude 3 Opus",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-sonnet",
    display_name: "Anthropic: Claude 3 Sonnet",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-haiku",
    display_name: "Anthropic: Claude 3 Haiku",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-opus:beta",
    display_name: "Anthropic: Claude 3 Opus (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-sonnet:beta",
    display_name: "Anthropic: Claude 3 Sonnet (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-3-haiku:beta",
    display_name: "Anthropic: Claude 3 Haiku (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-2-70b-chat",
    display_name: "Meta: Llama v2 70B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/nousresearch/nous-capybara-34b",
    display_name: "Nous: Capybara 34B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/jondurbin/airoboros-l2-70b",
    display_name: "Airoboros 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/jondurbin/bagel-34b",
    display_name: "Bagel 34B v0.2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/austism/chronos-hermes-13b",
    display_name: "Chronos Hermes 13B v2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-7b-instruct",
    display_name: "Mistral 7B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openchat/openchat-7b",
    display_name: "OpenChat 3.5",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/lizpreciatior/lzlv-70b-fp16-hf",
    display_name: "lzlv 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mixtral-8x7b-instruct",
    display_name: "Mixtral 8x7B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/cognitivecomputations/dolphin-mixtral-8x7b",
    display_name: "Dolphin 2.6 Mixtral 8x7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/neversleep/noromaid-mixtral-8x7b-instruct",
    display_name: "Noromaid Mixtral 8x7B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/recursal/rwkv-5-3b-ai-town",
    display_name: "RWKV v5 3B AI Town",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemma-7b-it",
    display_name: "Google: Gemma 7B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/databricks/dbrx-instruct",
    display_name: "Databricks: DBRX 132B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2",
    display_name: "Anthropic: Claude v2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2.1",
    display_name: "Anthropic: Claude v2.1",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2.0",
    display_name: "Anthropic: Claude v2.0",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-instant-1",
    display_name: "Anthropic: Claude Instant v1",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-instant-1.2",
    display_name: "Anthropic: Claude Instant v1.2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-1",
    display_name: "Anthropic: Claude v1",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-1.2",
    display_name: "Anthropic: Claude (older v1)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-instant-1.0",
    display_name: "Anthropic: Claude Instant (older v1)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-instant-1.1",
    display_name: "Anthropic: Claude Instant (older v1.1)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2:beta",
    display_name: "Anthropic: Claude v2 (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2.1:beta",
    display_name: "Anthropic: Claude v2.1 (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-2.0:beta",
    display_name: "Anthropic: Claude v2.0 (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/anthropic/claude-instant-1:beta",
    display_name: "Anthropic: Claude Instant v1 (self-moderated)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/huggingfaceh4/zephyr-7b-beta:free",
    display_name: "Hugging Face: Zephyr 7B (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openchat/openchat-7b:free",
    display_name: "OpenChat 3.5 (free)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mixtral-8x7b-instruct:nitro",
    display_name: "Mixtral 8x7B Instruct (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-2-70b-chat:nitro",
    display_name: "Meta: Llama v2 70B Chat (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/gryphe/mythomax-l2-13b:nitro",
    display_name: "MythoMax 13B (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-7b-instruct:nitro",
    display_name: "Mistral 7B Instruct (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemma-7b-it:nitro",
    display_name: "Google: Gemma 7B (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/databricks/dbrx-instruct:nitro",
    display_name: "Databricks: DBRX 132B Instruct (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-tiny",
    display_name: "Mistral Tiny",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-small",
    display_name: "Mistral Small",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-medium",
    display_name: "Mistral Medium",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mistral-large",
    display_name: "Mistral Large",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mixtral-8x22b",
    display_name: "Mistral: Mixtral 8x22B (base)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/cohere/command",
    display_name: "Cohere: Command",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/cohere/command-r",
    display_name: "Cohere: Command R",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/cohere/command-r-plus",
    display_name: "Cohere: Command R+",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemini-pro-1.5",
    display_name: "Google: Gemini Pro 1.5 (preview)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/fireworks/mixtral-8x22b-instruct-preview",
    display_name: "Fireworks Mixtral 8x22B Instruct OH (preview)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/microsoft/wizardlm-2-8x22b",
    display_name: "WizardLM-2 8x22B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/mistralai/mixtral-8x22b-instruct",
    display_name: "Mistral: Mixtral 8x22B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-3-70b-instruct",
    display_name: "Meta: Llama 3 70B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-3-8b-instruct",
    display_name: "Meta: Llama 3 8B Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-3-70b-instruct:nitro",
    display_name: "Meta: Llama 3 70B Instruct (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-3-8b-instruct:nitro",
    display_name: "Meta: Llama 3 8B Instruct (nitro)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/meta-llama/llama-3-8b-instruct:extended",
    display_name: "Meta: Llama 3 8B Instruct (extended)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/sao10k/fimbulvetr-11b-v2",
    display_name: "Fimbulvetr 11B v2",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/openai/gpt-4o",
    display_name: "OpenAI: GPT-4o",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/liuhaotian/llava-yi-34b",
    display_name: "LLaVA v1.6 34B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-72b-chat",
    display_name: "Qwen 1.5 72B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-110b-chat",
    display_name: "Qwen 1.5 110B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-32b-chat",
    display_name: "Qwen 1.5 32B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-14b-chat",
    display_name: "Qwen 1.5 14B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-7b-chat",
    display_name: "Qwen 1.5 7B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/qwen/qwen-4b-chat",
    display_name: "Qwen 1.5 4B Chat",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/google/gemini-flash-1.5",
    display_name: "Google: Gemini Flash 1.5 (preview)",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/llama-3-sonar-small-32k-chat",
    display_name: "Perplexity: Llama3 Sonar 8B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/llama-3-sonar-small-32k-online",
    display_name: "Perplexity: Llama3 Sonar 8B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/llama-3-sonar-large-32k-chat",
    display_name: "Perplexity: Llama3 Sonar 70B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/perplexity/llama-3-sonar-large-32k-online",
    display_name: "Perplexity: Llama3 Sonar 70B Online",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/microsoft/phi-3-mini-128k-instruct",
    display_name: "Phi-3 Mini Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/microsoft/phi-3-medium-128k-instruct",
    display_name: "Phi-3 Medium Instruct",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/fireworks/firellava-13b",
    display_name: "FireLLaVA 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "openrouter/liuhaotian/llava-13b",
    display_name: "LLaVA 13B",
    provider: {
      provider_name: "Openrouter",
      provider_id: "openrouter",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "groq/mixtral-8x7b-32768",
    display_name: "Groq Mixtral 8x7b",
    provider: {
      provider_name: "Groq",
      provider_id: "groq",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "groq/gemma-7b-it",
    display_name: "Groq Gemma 7B",
    provider: {
      provider_name: "Groq",
      provider_id: "groq",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "groq/llama3-8b-8192",
    display_name: "Groq Llama3 8B 8192",
    provider: {
      provider_name: "Groq",
      provider_id: "groq",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "groq/llama3-70b-8192",
    display_name: "Groq Llama3 70B 8192",
    provider: {
      provider_name: "Groq",
      provider_id: "groq",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "together_ai/Qwen/Qwen1.5-32B-Chat",
    display_name: "Qwen1.5-32B-Chat",
    provider: {
      provider_name: "TogetherAI",
      provider_id: "togetherai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "together_ai/meta-llama/Llama-3-8b-chat-hf",
    display_name: "Llama-3-8b-chat-hf",
    provider: {
      provider_name: "TogetherAI",
      provider_id: "togetherai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "together_ai/meta-llama/Llama-3-8b-hf",
    display_name: "Llama-3-8b-hf",
    provider: {
      provider_name: "TogetherAI",
      provider_id: "togetherai",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "perplexity/llama-3-sonar-small-32k-chat",
    display_name: "sonar-small-32k-chat",
    provider: {
      provider_name: "Perplexity",
      provider_id: "perplexity",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "perplexity/llama-3-sonar-small-32k-online",
    display_name: "sonar-small-32k-chat-online",
    provider: {
      provider_name: "Perplexity",
      provider_id: "perplexity",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "perplexity/llama-3-sonar-large-32k-online",
    display_name: "sonar-large-32k-chat-online",
    provider: {
      provider_name: "Perplexity",
      provider_id: "perplexity",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "fireworks_ai/llama-v3-70b-instruct",
    display_name: "Fireworks Llama3 70B",
    provider: {
      provider_name: "Fireworks",
      provider_id: "fireworks",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "fireworks_ai/llama-v3-8b-instruct",
    display_name: "Fireworks Llama3 8B",
    provider: {
      provider_name: "Fireworks",
      provider_id: "fireworks",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "fireworks_ai/mixtral-8x7b-instruct",
    display_name: "Fireworks Mixtral 8x7B",
    provider: {
      provider_name: "Fireworks",
      provider_id: "fireworks",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
  {
    model_name: "bedrock/anthropic.claude-3-opus-20240229-v1:0",
    display_name: "bedrock/anthropic.claude-3-opus",
    provider: {
      provider_name: "Bedrock",
      provider_id: "bedrock",
      moderation: "Filtered",
      credential_fields: ["api_key"],
    },
  },
];

export const DEFAULT_MODELS = [
  ...openaiModels.map(({ model_name, display_name, provider }) => ({
    name: model_name,
    displayName: display_name,
    available: true,
    provider: {
      id: provider.provider_id,
      providerName: provider.provider_name,
    },
  })),
] as const;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

// some famous webdav endpoints
export const internalAllowedWebDavEndpoints = [
  "https://dav.jianguoyun.com/dav/",
  "https://dav.dropdav.com/",
  "https://dav.box.com/dav",
  "https://nanao.teracloud.jp/dav/",
  "https://bora.teracloud.jp/dav/",
  "https://webdav.4shared.com/",
  "https://dav.idrivesync.com",
  "https://webdav.yandex.com",
  "https://app.koofr.net/dav/Koofr",
];
