export enum ImpromptuSpeechPromptKeys {
  Questions = "Questions",
  Score = "Score",
}

export class ImpromptuSpeechPrompts {
  static GetQuestionsPrompt(topic: string, nums: number): string {
    return `The topic is: "${topic}",
      To give me ${nums} questions about this topic used in table topics session.
      Your answer should be in json format with List<string>, like:
      [
      "xxx",
      "yyy"
      ]
      No any extra words, only json format.
      `;
  }
}

// 调用静态方法
// ExampleClass.staticMethod();
