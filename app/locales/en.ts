import type { LocaleType } from './index'

const en: LocaleType = {
    ChatItem: {
        ChatItemCount: (count: number) => `${count} messages`,
    },
    Chat: {
        SubTitle: (count: number) => `${count} messages with ChatGPT`,
        Actions: {
            ChatList: 'Go To Chat List',
            CompressedHistory: 'Compressed History Memory Prompt',
            Export: 'Export All Messages as Markdown',
        },
        Typing: 'Typing…',
        Input: (submitKey: string) => `Type something and press ${submitKey} to send`,
        Send: 'Send',
    },
    Export: {
        Title: 'All Messages',
        Copy: 'Copy All',
        Download: 'Download',
    },
    Memory: {
        Title: 'Memory Prompt',
        EmptyContent: 'Nothing yet.',
        Copy: 'Copy All',
    },
    Home: {
        NewChat: 'New Chat',
    },
    Settings: {
        Title: 'Settings',
        SubTitle: 'All Settings',
        Actions: {
            ClearAll: 'Clear All Data',
            ResetAll: 'Reset All Settings',
            Close: 'Close',
        },
        Lang: {
            Name: '语言',
            Options: {
                cn: '中文',
                en: 'English'
            }
        },
        Avatar: 'Avatar',
        SendKey: 'Send Key',
        Theme: 'Theme',
        TightBorder: 'Tight Border',
        HistoryCount: 'History Message Count',
        CompressThreshold: 'Message Compression Threshold',
    },
    Store: {
        DefaultTopic: 'New Conversation',
        BotHello: 'Hello! How can I assist you today?',
        Error: 'Something went wrong, please try again later.',
        Prompt: {
            History: (content: string) => 'This is a summary of the chat history between the AI and the user as a recap: ' + content,
            Topic: "Provide a brief topic of the sentence without explanation. If there is no topic, return 'Chitchat'.",
            Summarize: 'Summarize our discussion briefly in 50 characters or less to use as a prompt for future context.',
        },
        ConfirmClearAll: 'Confirm to clear all chat and setting data?',
    },
    Copy: {
        Success: 'Copied to clipboard',
        Failed: 'Copy failed, please grant permission to access clipboard',
    }
}

export default en;