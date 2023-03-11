import type { ChatRequest, ChatReponse } from "./api/chat/typing";
import { Message } from "./store";

const makeRequestParam = (
  messages: Message[],
  options?: {
    filterBot?: boolean;
    stream?: boolean;
  }
): ChatRequest => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  if (options?.filterBot) {
    sendMessages = sendMessages.filter((m) => m.role !== "assistant");
  }

  return {
    model: "gpt-3.5-turbo",
    messages: sendMessages,
    stream: options?.stream,
  };
};

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages, { filterBot: true });

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
    filterBot?: boolean;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error) => void;
  }
) {
  const req = makeRequestParam(messages, {
    stream: true,
    filterBot: options?.filterBot,
  });

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
  } else {
    options?.onError(new Error("NetWork Error"));
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
