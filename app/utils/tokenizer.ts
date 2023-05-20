// @ts-expect-error
import wasm from "@dqbd/tiktoken/lite/tiktoken_bg.wasm?module";
import model from "@dqbd/tiktoken/encoders/cl100k_base.json";
import { init, Tiktoken } from "@dqbd/tiktoken/lite/init";
import { TiktokenModel } from "@dqbd/tiktoken";

async function getUserSelectedEncoder(m: TiktokenModel) {
  await init((imports) => WebAssembly.instantiate(wasm, imports));

  const special_tokens = model.special_tokens;

  if (m === "gpt-4" || m === "gpt-4-32k" || m === "gpt-3.5-turbo") {
    return new Tiktoken(
      model.bpe_ranks,
      {
        ...special_tokens,
        "<|im_start|>": 100264,
        "<|im_end|>": 100265,
        "<|im_sep|>": 100266,
      },
      model.pat_str,
    );
  }
  return new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);
}

type Message = { role: string; content: string };

function convertPrompt(messages: Message[]) {
  return (
    messages
      .map((message) => {
        return `<|im_start|>${message.role}\n${message.content}<|im_end|>\n`;
      })
      .join("") + "<|im_start|>assistant\n"
  );
}

// 获取 价格比例
export function getRatio(model: TiktokenModel, isPrompt: boolean) {
  // 根据前缀
  if (model.startsWith("gpt-3.5")) {
    return 0.002;
  }
  if (model.startsWith("gpt-4")) {
    return isPrompt ? 0.03 : 0.06;
  }
  if (model.startsWith("gpt-4-32k")) {
    return isPrompt ? 0.06 : 0.12;
  }
  throw new Error("unknown model");
}

// 获取 模型下 Message[] 所消耗的token数量 以及 花费
export async function getPromptCost(model: TiktokenModel, messages: Message[]) {
  const encoder = await getUserSelectedEncoder(model);
  const prompt = convertPrompt(messages);
  const tokens = encoder.encode(prompt, "all").length;
  encoder.free();
  return {
    tokens: tokens,
    cost: tokens * getRatio(model, true),
  };
}

export async function getCompletionCost(
  model: TiktokenModel,
  messages: string,
) {
  const encoder = await getUserSelectedEncoder(model);
  const tokens = encoder.encode(messages, "all").length;
  encoder.free();
  return {
    tokens: tokens,
    cost: tokens * getRatio(model, false),
  };
}
