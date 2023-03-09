import { type ChatCompletionResponseMessage } from "openai";

export type Message = ChatCompletionResponseMessage;

interface ChatConfig {
  maxToken: number;
}

class ChatSession {
  constructor(private id: string) {}

  public async onChatMessage(message: Message) {
    if (message.role === "assistant") {
      // do nothing
    } else if (message.role === "user") {
      // TODO: request open chat
      this.makeRequest();
    } else throw Error("Only assistant or users message allowed here.");

    this.historyMessages.push(message);
    this.summarize();
    this.save();
  }
  public async summarize() {}
  public save() {}
  public delete() {}

  private makeRequest() {}

  private topic = "";
  private memoryPrompt = "";
  private historyMessages: Message[] = [];
  private messageWordCount = 0;
}

class ChatSessionManager {
  private entryId = "chatgpt-next-web-sessions";
}

export const store = {};
