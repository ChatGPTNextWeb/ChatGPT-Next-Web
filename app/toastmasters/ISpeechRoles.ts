import { ToastmastersRoles } from "./roles";

// TODO:
export const SpeechDefaultLangugage = "en";

export enum ImpromptuSpeechPromptKeys {
  Questions = "Questions",
  Score = "Score",
  SampleSpeech = "Score",
}

export enum ImpromptuSpeechRoles {
  TableTopicsEvaluator = "Table Topics Evaluator",

  General = "General",

  // Grammarian = "Grammarian",
  // AhCounter = "Ah-Counter",
  // Timer = "Timer",
  // GeneralEvaluator = "General Evaluator",

  RevisedSpeech = "Revised Speech",
  Samplepeech = "Sample Speech",
}

// need default value, so class
export class IQuestionItem {
  Question: string = "";
  SampleSpeech: string = "";

  Speech: string = "";
  SpeechTime: number = 0;
  SpeechAudio: Blob | null = null;

  Score: number = 0;
  Evaluations: Record<string, string> = {};

  ResetCurrent() {
    this.Speech = "";
    this.SpeechTime = 0;
    this.SpeechAudio = null;
    this.Score = 0;
    this.Evaluations = {};
  }
}

export class ImpromptuSpeechInput {
  ActivePage: string = ImpromptuSpeechStage.Start;

  // 0: setting, 1: main page
  // ActiveStep: number = 0;
  Topic: string = "";

  HasQuestions: boolean = false;
  QuestionNums: number = 2;
  Interaction: string = ImpromptuSpeechModes.Free;
  Mode: string = ImpromptuSpeechModes.Personal;

  QuestionItems: IQuestionItem[] = [];
}

// 定义状态枚举
export enum ImpromptuSpeechStage {
  Start = "",
  Question = "Question",
  Report = "Report",
}

export enum ImpromptuSpeechModes {
  // interaction
  Free = "Free",
  Interview = "Interview",
  // mode
  Personal = "Personal",
  Hosting = "Hosting",
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

  static GetEvaluationRoles(): string[] {
    return [ImpromptuSpeechRoles.General, ImpromptuSpeechRoles.RevisedSpeech];
  }

  static GetEvaluationPrompts(
    currentNum: number,
    question: string,
    speech: string,
  ): Record<string, string> {
    return {
      [ImpromptuSpeechRoles.General]: `The No.${currentNum} Question and Speech are:
      {
        "Question": "${question}",
        "Speech": "${speech}"
      },
      
      You are the ${ToastmastersRoles.TableTopicsEvaluator}, to evaluate my speech.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to me based on my speech.
      4). About 100 words.
      `,
      [ImpromptuSpeechRoles.RevisedSpeech]: `To the No.${currentNum} Question and Speech.

      You are an teacher of Table Topics.
      Help revise, polish and improve my speech,
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). 150 Words.
      `,
    };
  }

  static GetEvaluationPrompt1(
    currentNum: number,
    question: string,
    speech: string,
  ): { role: string; content: string }[] {
    return [
      {
        role: "Feedback",
        content: `The No.${currentNum} Question and Speech are:
        {
          "Question": "${question}",
          "Speech": "${speech}"
        },
        
        You are the ${ToastmastersRoles.TableTopicsEvaluator}, to evaluate my speech.
        Your evaluation should:
        1). Don't make things up, all your quoted sentence must from my speech.
        2). Bold keywords using markdown when present your answer.
        3). Provide addvice to me based on my speech.
        4). About 100 words.
        `,
      },
      {
        role: "Revised Speech",
        content: `
        To the No.${currentNum} Question and Speech.

        You are an teacher of Table Topics.
        Help revise, polish and improve my speech,
        You should:
        1). Don't say who you are, just provide your revised speech.
        2). Bold keywords using markdown when present your answer.
        3). 150 Words.
        `,
      },
    ];
  }
}
