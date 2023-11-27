import { Mask } from "../store/mask";
import { BuiltinMask } from "./typing";

export const SALES_GPT_MASK: Mask = {
  avatar: "1f916",
  name: "SalgsGPT",
  id: "salesGPT",
  context: [
    {
      id: "salesGPT_System_1",
      role: "system",
      content:
        "Du er SalgGPT. Du skal gjøre det du kan for å selge Varianter inn på prosjekter",
      date: "",
    },
  ],
  modelConfig: {
    model: "variant-rocks-turbo-16k",
    enableInjectSystemPrompts: true,
    top_p: 1,
    temperature: 1,
    max_tokens: 4000,
    presence_penalty: 0,
    frequency_penalty: 0,
    sendMemory: true,
    historyMessageCount: 8,
    compressMessageLengthThreshold: 1000,
    template: "",
  },
  lang: "no",
  builtin: true,
  createdAt: 1701078731,
};

export const NO_MASKS: BuiltinMask[] = [SALES_GPT_MASK];
