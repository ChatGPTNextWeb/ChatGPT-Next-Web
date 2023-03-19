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
  compressMessageLengthThreshold: number;
  sendBotMessages: boolean; // send bot's message or not
  submitKey: SubmitKey;
  avatar: string;
  theme: Theme;
  tightBorder: boolean;
}

const DEFAULT_CONFIG: ChatConfig = {
  historyMessageCount: 5,
  compressMessageLengthThreshold: 500,
  sendBotMessages: true as boolean,
  submitKey: SubmitKey.CtrlEnter as SubmitKey,
  avatar: "1f603",
  theme: Theme.Auto as Theme,
  tightBorder: false,
};

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
  lastSummarizeIndex: number;
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
    lastSummarizeIndex: 0,
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
  summarizeSession: () => void;
  updateStat: (message: Message) => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: Message) => void
  ) => void;
  getMessagesWithMemory: () => Message[];

  getConfig: () => ChatConfig;
  resetConfig: () => void;
  updateConfig: (updater: (config: ChatConfig) => void) => void;
  clearAllData: () => void;
}

const LOCAL_KEY = "chat-next-web-store";

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [createEmptySession()],
      currentSessionIndex: 0,
      config: {
        ...DEFAULT_CONFIG,
      },

      resetConfig() {
        set(() => ({ config: { ...DEFAULT_CONFIG } }));
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
        get().updateStat(message);
        get().summarizeSession();
      },

      async onUserInput(content) {
        const message: Message = {
          role: "user",
          content,
          date: new Date().toLocaleString(),
        };

        get().updateCurrentSession((session) => {
          session.messages.push(message);
        });

        // get last five messges
        const messages = get().currentSession().messages.concat(message);

        const botMessage: Message = {
          content: "",
          role: "assistant",
          date: new Date().toLocaleString(),
          streaming: true,
        };

        get().updateCurrentSession((session) => {
          session.messages.push(botMessage);
        });

        const recentMessages = get().getMessagesWithMemory()

        requestChatStream(recentMessages, {
          onMessage(content, done) {
            if (done) {
              botMessage.streaming = false;
              get().onNewMessage(botMessage)
            } else {
              botMessage.content = content;
              set(() => ({}));
            }
          },
          onError(error) {
            botMessage.content += "\n\n出错了，稍后重试吧";
            botMessage.streaming = false;
            set(() => ({}));
          },
          filterBot: !get().config.sendBotMessages,
        });
      },

      getMessagesWithMemory() {
        const session = get().currentSession()
        const config = get().config
        const recentMessages = session.messages.slice(-config.historyMessageCount);

        const memoryPrompt: Message = {
          role: 'system',
          content: '这是你和用户的历史聊天总结：' + session.memoryPrompt,
          date: ''
        }

        if (session.memoryPrompt) {
          recentMessages.unshift(memoryPrompt)
        }

        return recentMessages
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

      summarizeSession() {
        const session = get().currentSession();

        if (session.topic === DEFAULT_TOPIC) {
          // should summarize topic
          requestWithPrompt(
            session.messages,
            "直接返回这句话的简要主题，不要解释，如果没有主题，请直接返回“闲聊”"
          ).then((res) => {
            get().updateCurrentSession(
              (session) => (session.topic = trimTopic(res))
            );
          });
        }

        const messages = get().getMessagesWithMemory()
        const toBeSummarizedMsgs = messages.slice(session.lastSummarizeIndex)
        const historyMsgLength = session.memoryPrompt.length + toBeSummarizedMsgs.reduce((pre, cur) => pre + cur.content.length, 0)
        const lastSummarizeIndex = messages.length
        if (historyMsgLength > 500) {
          requestChatStream(toBeSummarizedMsgs.concat({
            role: 'system',
            content: '总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 50 字以内',
            date: ''
          }), {
            filterBot: false,
            onMessage(message, done) {
              session.memoryPrompt = message
              session.lastSummarizeIndex = lastSummarizeIndex
              if (done) {
                console.log('[Memory] ', session.memoryPrompt)
              }
            },
            onError(error) {
              console.error('[Summarize] ', error)
            },
          })
        }
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

      clearAllData() {
        if (confirm('确认清除所有聊天、设置数据？')) {
          localStorage.clear()
          location.reload()
        }
      },
    }),
    {
      name: LOCAL_KEY,
    }
  )
);
