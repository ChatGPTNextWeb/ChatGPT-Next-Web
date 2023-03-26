import type { ChatRequest, ChatReponse } from "./api/chat/typing";
import { filterConfig, Message, ModelConfig, useAccessStore } from "./store";
import Locale from "./locales";

const TIME_OUT_MS = 30000;

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

function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  if (accessStore.enabledAccessControl()) {
    headers["access-code"] = accessStore.accessCode;
  }

  return headers;
}

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages, { filterBot: true });

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(req),
  });

  return (await res.json()) as ChatReponse;
}

export async function requestChatStream(
  messages: Message[],
  options?: {
    filterBot?: boolean;
    modelConfig?: ModelConfig;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error) => void;
    onController?: (controller: AbortController) => void;
  }
) {
  const req = makeRequestParam(messages, {
    stream: true,
    filterBot: options?.filterBot,
  });

  // valid and assign model config
  if (options?.modelConfig) {
    Object.assign(req, filterConfig(options.modelConfig));
  }

  console.log("[Request] ", req);

  const controller = new AbortController();
  const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

  try {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(reqTimeoutId);

    let responseText = "";

    const finish = () => {
      options?.onMessage(responseText, true);
      controller.abort();
    };

    if (res.ok) {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      options?.onController?.(controller);

      while (true) {
        // handle time out, will stop if no response in 10 secs
        const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
        const content = await reader?.read();
        clearTimeout(resTimeoutId);
        const text = decoder.decode(content?.value);
        responseText += text;

        const done = !content || content.done;
        options?.onMessage(responseText, false);

        if (done) {
          break;
        }
      }

      finish();
    } else if (res.status === 401) {
      console.error("Anauthorized");
      responseText = Locale.Error.Unauthorized;
      finish();
    } else {
      console.error("Stream Error");
      options?.onError(new Error("Stream Error"));
    }
  } catch (err) {
    console.error("NetWork Error", err);
    options?.onError(err as Error);
  }
}

export async function requestWithPrompt(messages: Message[], prompt: string) {
  messages = messages.concat([
    {
      role: "user",
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages);

  return res.choices.at(0)?.message?.content ?? "";
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(
    sessionIndex: number,
    messageIndex: number,
    controller: AbortController
  ) {
    const key = this.key(sessionIndex, messageIndex);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageIndex: number) {
    const key = this.key(sessionIndex, messageIndex);
    const controller = this.controllers[key];
    console.log(controller);
    controller?.abort();
  },

  remove(sessionIndex: number, messageIndex: number) {
    const key = this.key(sessionIndex, messageIndex);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
