import { BuiltinMask } from "./typing";

export const CN_MASKS: BuiltinMask[] = [
  {
    avatar: "1f978",
    name: "代码调试专家",
    hideContext: true,
    context: [
      {
        id: "writer-0",
        role: "system",
        content:
          "我想让你扮演一名少儿编程教师。我是一名学生，我将提供一些代码和问题，你的工作是用帮我找出其中的错误，并修正代码，最后做出解释。请不要回答和编程或者代码无关的问题。",
        date: "",
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 1,
      max_tokens: 2000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
    },
    lang: "cn",
    builtin: true,
    createdAt: 1688899480511,
  },
  {
    avatar: "1f916",
    name: "代码生成助手",
    hideContext: true,
    context: [
      {
        id: "writer-1",
        role: "system",
        content:
          "我想让你扮演一名少儿编程教师。我是一名学生，我将询问一些问题，请写出相应的代码，并写好注释，最后做出解释。不特别说明的话，用C++语言来写代码。请不要回答和编程或者代码无关的问题。",
        date: "",
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 1,
      max_tokens: 2000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 4,
      compressMessageLengthThreshold: 1000,
    },
    lang: "cn",
    builtin: true,
    createdAt: 1688899480511,
  },
];
