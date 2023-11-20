export enum ImpromptuSpeechPromptKeys {
  Questions = "Questions",
  Score = "Score",
  SampleSpeech = "Score",
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

  static GetScorePrompt(
    currentNum: number,
    question: string,
    speech: string,
  ): string {
    return `The No.${currentNum} Question and Speech are:
    {
      "Question": "${question}",
      "Speech": "${speech}"
    },

    You are the strict Table Topics Evaluator, give me a score to my speech.
    Note, your answer should only be a number between 0 to 100, no any extra words.
    `;
  }

  static GetSampleSpeechPrompt(currentNum: number, question: string): string {
    return `The No.${currentNum} Question is:
    "${question}",

    Give me a sample impromptu speech.
    You should:
      1). Bold keywords using markdown when present your answer.
      2). Note, your answer should only include speech content, no any extra words.
      3). About 100 words.
    `;
  }
}

// 调用静态方法
// ExampleClass.staticMethod();
