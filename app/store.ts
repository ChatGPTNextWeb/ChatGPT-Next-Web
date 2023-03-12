import { create } from "zustand";
import { persist } from "zustand/middleware";

import { type ChatCompletionResponseMessage } from "openai";
import { requestChat, requestChatStream, requestWithPrompt } from "./requests";
import { trimTopic } from "./utils";

export type Message = ChatCompletionResponseMessage & {
  date: string;
  streaming?: boolean;
};

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

interface ChatConfig {
  maxToken?: number;
  historyMessageCount: number; // -1 means all
  sendBotMessages: boolean; // send bot's message or not
  submitKey: SubmitKey;
  avatar: string;
  theme: Theme;
}

interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

interface ChatSession {
  id: number;
  topic: string;
  memoryPrompt: string;
  messages: Message[];
  stat: ChatStat;
  lastUpdate: string;
  deleted?: boolean;
}

const DEFAULT_TOPIC = "新的聊天";

function createEmptySession(): ChatSession {
  const createDate = new Date().toLocaleString();

  return {
    id: Date.now(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [
      {
        role: "assistant",
        content: "有什么可以帮你的吗",
        date: createDate,
      },
    ],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: createDate,
  };
}

interface ChatStore {
  config: ChatConfig;
  sessions: ChatSession[];
  currentSessionIndex: number;
  removeSession: (index: number) => void;
  selectSession: (index: number) => void;
  newSession: () => void;
  currentSession: () => ChatSession;
  onNewMessage: (message: Message) => void;
  onUserInput: (content: string) => Promise<void>;
  onBotResponse: (message: Message) => void;
  summarizeSession: () => void;
  updateStat: (message: Message) => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: Message) => void
  ) => void;

  getConfig: () => ChatConfig;
  updateConfig: (updater: (config: ChatConfig) => void) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [createEmptySession()],
      currentSessionIndex: 0,
      config: {
        historyMessageCount: 5,
        sendBotMessages: false as boolean,
        submitKey: SubmitKey.CtrlEnter as SubmitKey,
        avatar: "1fae0",
        theme: Theme.Auto as Theme,
      },

      getConfig() {
        return get().config;
      },

      updateConfig(updater) {
        const config = get().config;
        updater(config);
        set(() => ({ config }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      removeSession(index: number) {
        set((state) => {
          let nextIndex = state.currentSessionIndex;
          const sessions = state.sessions;

          if (sessions.length === 1) {
            return {
              currentSessionIndex: 0,
              sessions: [createEmptySession()],
            };
          }

          sessions.splice(index, 1);

          if (nextIndex === index) {
            nextIndex -= 1;
          }

          return {
            currentSessionIndex: nextIndex,
            sessions,
          };
        });
      },

      newSession() {
        set((state) => ({
          currentSessionIndex: 0,
          sessions: [createEmptySession()].concat(state.sessions),
        }));
      },

      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.messages.push(message);
        });
        get().updateStat(message);
        get().summarizeSession();
      },

      async onUserInput(content) {
        const message: Message = {
          role: "user",
          content,
          date: new Date().toLocaleString(),
        };

        // get last five messges
        const messages = get().currentSession().messages.concat(message);
        get().onNewMessage(message);

        const botMessage: Message = {
          content: "",
          role: "assistant",
          date: new Date().toLocaleString(),
          streaming: true,
        };

        get().updateCurrentSession((session) => {
          session.messages.push(botMessage);
        });

        const fiveMessages = messages.slice(-5);

        requestChatStream(fiveMessages, {
          onMessage(content, done) {
            if (done) {
              botMessage.streaming = false;
              get().updateStat(botMessage);
              get().summarizeSession();
            } else {
              botMessage.content = content;
              set(() => ({}));
            }
          },
          onError(error) {
            botMessage.content = "出错了，稍后重试吧";
            botMessage.streaming = false;
            set(() => ({}));
          },
          filterBot: !get().config.sendBotMessages,
        });
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: Message) => void
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      onBotResponse(message) {
        get().onNewMessage(message);
      },

      summarizeSession() {
        const session = get().currentSession();

        if (session.topic !== DEFAULT_TOPIC) return;

        requestWithPrompt(
          session.messages,
          "简明扼要地 10 字以内总结主题"
        ).then((res) => {
          get().updateCurrentSession(
            (session) => (session.topic = trimTopic(res))
          );
        });
      },

      updateStat(message) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length;
          // TODO: should update chat count and word count
        });
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },
    }),
    { name: "chat-next-web-store" }
  )
);
