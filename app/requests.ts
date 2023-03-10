import type { ChatRequest, ChatReponse } from "./api/chat/typing";
import { Message } from "./store";

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = {
    model: "gpt-3.5-turbo",
    messages: messages
      .map((v) => ({
        role: v.role,
        content: v.content,
      }))
      .filter((m) => m.role !== "assistant"),
  };

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  return (await res.json()) as ChatReponse;
}

export async function requestWithPrompt(messages: Message[], prompt: string) {
  messages = messages.concat([
    {
      role: "system",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages);

  return res.choices.at(0)?.message?.content ?? "";
}
