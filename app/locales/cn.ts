
const cn = {
    ChatItem: {
        ChatItemCount: (count: number) => `${count} 条对话`,
    },
    Chat: {
        SubTitle: (count: number) => `与 ChatGPT 的 ${count} 条对话`,
        Actions: {
            ChatList: '查看消息列表',
            CompressedHistory: '查看压缩后的历史 Prompt',
            Export: '导出聊天记录',
        },
        Typing: '正在输入…',
        Input: (submitKey: string) => `输入消息，${submitKey} 发送`,
        Send: '发送',
    },
    Export: {
        Title: '导出聊天记录为 Markdown',
        Copy: '全部复制',
        Download: '下载文件',
    },
    Memory: {
        Title: '上下文记忆 Prompt',
        EmptyContent: '尚未记忆',
        Copy: '全部复制',
    },
    Home: {
        NewChat: '新的聊天',
    },
    Settings: {
        Title: '设置',
        SubTitle: '设置选项',
        Actions: {
            ClearAll: '清除所有数据',
            ResetAll: '重置所有选项',
            Close: '关闭',
        },
        Lang: {
            Name: 'Language',
            Options: {
                cn: '中文',
                en: 'English'
            }
        },
        Avatar: '头像',
        SendKey: '发送键',
        Theme: '主题',
        TightBorder: '紧凑边框',
        HistoryCount: '附带历史消息数',
        CompressThreshold: '历史消息长度压缩阈值',
    },
    Store: {
        DefaultTopic: '新的聊天',
        BotHello: '有什么可以帮你的吗',
        Error: '出错了，稍后重试吧',
        Prompt: {
            History: (content: string) => '这是 ai 和用户的历史聊天总结作为前情提要：' + content,
            Topic: "直接返回这句话的简要主题，不要解释，如果没有主题，请直接返回“闲聊”",
            Summarize: '简要总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 50 字以内',
        },
        ConfirmClearAll: '确认清除所有聊天、设置数据？',
    },
    Copy: {
        Success: '已写入剪切板',
        Failed: '复制失败，请赋予剪切板权限',
    }
}

export type LocaleType = typeof cn;

export default cn;