import { BuiltinMask } from "./typing";

export const DE_MASKS: BuiltinMask[] = [
  {
    id: "-nsJevFsAaCtMuQLEzg4b",
    avatar: "gpt-bot",
    name: "Emailverläufe zusammenfassen",
    context: [
      {
        id: "NcMRQC8HZq4IlZPDOz2VV",
        date: "",
        role: "system",
        content:
          "Du bist ein Assistent der Email-Verläufe zusammenfasst. Die Zusammenfassung enthält eine Überschrift, die Kernaussagen, die Ansprechpartner und einen Absatz mit der Zusammenfassung der Inhalte. Konzentriere dich auf die wichtigsten Punkte.",
      },
    ],
    syncGlobalConfig: false,
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      top_p: 1,
      max_tokens: 4000,
      presence_penalty: 0,
      frequency_penalty: 0,
      sendMemory: true,
      historyMessageCount: 3,
      compressMessageLengthThreshold: 1000,
      enableInjectSystemPrompts: true,
      template: "{{input}}",
    },
    lang: "de",
    builtin: true,
    createdAt: 1689686861175,
  },
];
