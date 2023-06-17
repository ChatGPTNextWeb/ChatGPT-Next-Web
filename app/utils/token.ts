import { encodingForModel } from "js-tiktoken";
import { ChatMessage } from "@/app/store";

export function estimateTokenLength(input: string): number {
  let tokenLength = 0;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25;
      } else {
        tokenLength += 0.5;
      }
    } else {
      // Unicode character
      tokenLength += 1.5;
    }
  }

  return tokenLength;
}

export function tiktokenChatMessages(model: any, messages: ChatMessage[]) {
  const encoding = encodingForModel(model);
  let tokensPerMessage: number;

  if (model === "gpt-3.5-turbo-0301" || model === "gpt-3.5-turbo") {
    tokensPerMessage = 4;
  } else {
    tokensPerMessage = 3;
  }
  let prompt_tokens = 0;
  length = messages.length;
  for (let i = 0; i < length; i++) {
    let message = messages[i];
    prompt_tokens += tokensPerMessage;
    prompt_tokens += encoding.encode(message.content).length;
    prompt_tokens += encoding.encode(message.role).length;
  }
  prompt_tokens += 3; // every reply is primed with assistant
  return prompt_tokens;
}

export function tiktokenChatMessage(model: any, message: string) {
  const encoding = encodingForModel(model);
  return encoding.encode(message).length;
}
