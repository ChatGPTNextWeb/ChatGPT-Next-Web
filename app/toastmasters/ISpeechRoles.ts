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

  Scores = "Scores",
  General = "General",

  // Grammarian = "Grammarian",
  // AhCounter = "Ah-Counter",
  // Timer = "Timer",
  // GeneralEvaluator = "General Evaluator",

  RevisedSpeech = "Revised Speech",
  Samplepeech = "Sample Speech",

  // Scores
  RelevanceDepth = "Relevance & Depth",
  OrganizationStructure = "Structure",
  LanguageUse = "Language",
  DeliverySkills = "Delivery",
  TimeManagement = "Time",
}

// need default value, so class
export class IQuestionItem {
  Question: string = "";
  SampleSpeech: string = "";

  Speech: string = "";
  SpeechTime: number = 0;
  SpeechAudio: Blob | null = null;

  Score: number = 0;
  Scores: { subject: string; score: number }[] = [];
  Evaluations: Record<string, string> = {};

  ResetCurrent() {
    this.Speech = "";
    this.SpeechTime = 0;
    this.SpeechAudio = null;
    this.Score = 0;
    this.Scores = [];
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

  static GetScoreRoles(): string[] {
    return [
      ImpromptuSpeechRoles.RelevanceDepth,
      ImpromptuSpeechRoles.OrganizationStructure,
      ImpromptuSpeechRoles.LanguageUse,
      ImpromptuSpeechRoles.DeliverySkills,
      ImpromptuSpeechRoles.TimeManagement,
    ];
  }

  // TODO: when anything is ready, will add this.
  static GetScoreRolesDescription(): string[] {
    return [
      `***${ImpromptuSpeechRoles.RelevanceDepth}***: Assess whether the content is relevant to the topic, whether the information is accurate, and if there is a thorough exploration of the subject`,
      ImpromptuSpeechRoles.OrganizationStructure,
      ImpromptuSpeechRoles.LanguageUse,
      ImpromptuSpeechRoles.DeliverySkills,
      ImpromptuSpeechRoles.TimeManagement,
    ];
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

    You are the strict Table Topics Evaluator, give me a score list to my speech.
    The score list is consist of below values, each score value is a number between 0 to 100.
    1). Relevance and Depth of Content: Assess whether the content is relevant to the topic, whether the information is accurate, and if there is a thorough exploration of the subject.
    2). Organization and Structure: Evaluate whether the introduction, development, and conclusion of the speech are clear and logically coherent.
    3). Language Use: Consider the choice of vocabulary, the correctness of grammar, and the appropriate use of metaphors or other rhetorical devices.
    4). Delivery Skills: Assess the fluency, clarity, and appropriateness of the speaking pace, It involves monitoring the usage of filler words (like "ah", "um", "er") and unnecessary pauses.

    Note, 
    1). You are so objective, strict and prefessional evaluator, not completed answer should have low score.
    2). you answer should only be a json list with these scores, no any extra words. like: [20, 40, 30, 50]    
    `;
  }

  /*
内容的相关性和深度：考察演讲内容是否与主题相关，信息是否准确，是否有深入探讨。
组织结构：评估演讲的开始、发展和结尾是否清晰，思路是否连贯。
语言使用：考察词汇选择、语法结构的正确性，以及是否恰当地使用比喻或其他修辞手法。
表达能力：评价说话的流畅性、清晰度和语速是否适宜。
*/
  //     1. The Relevance Score: Evaluate the relevance between the Question and Speech.
  // 2. The Fluency Score: you play the Ah-Counter to assess the fluency of my speech and identify the use of filler words (e.g., 'um,' 'uh').
  // 3. The Content Score: you play the Grammarian to evaluate the overall quality of my speech, including grammar, vocabulary, and logical flow.
  // You should:
  // 1). Your answer should only be a number between 0 to 100, no any extra words.
  // 2). You score should be objective and linear, you should fully consider
  // the relevance between Question and Speech,
  // the fluency (like the Ah-Counter),
  // the content and expression (like the Grammarian),
  // the completeness (like the timer, standard impromptu speech is 2 minutes).
  // 3). You final score is the weighted average for above indexes.

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
