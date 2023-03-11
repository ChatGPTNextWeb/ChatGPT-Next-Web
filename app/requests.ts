import type { ChatRequest, ChatReponse } from "./api/chat/typing";
import { Message } from "./store";

const makeRequestParam = (messages: Message[], stream = false): ChatRequest => {
  return {
    model: "gpt-3.5-turbo",
    messages: messages
      .map((v) => ({
        role: v.role,
        content: v.content,
      }))
      .filter((m) => m.role !== "assistant"),
    stream,
  };
};

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  return (await res.json()) as ChatReponse;
}

export async function requestChatStream(
  messages: Message[],
  options?: {
    onMessage: (message: string, done: boolean) => void;
  }
) {
  const req = makeRequestParam(messages, true);

  const res = await fetch("/api/chat-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  let responseText = "";

  if (res.ok) {
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const content = await reader?.read();
      const text = decoder.decode(content?.value);
      responseText += text;

      const done = !content || content.done;
      options?.onMessage(responseText, false);

      if (done) {
        break;
      }
    }

    options?.onMessage(responseText, true);
  }
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
