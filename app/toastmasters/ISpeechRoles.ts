import { ToastmastersRoles } from "./roles";

// TODO:
export const SpeechDefaultLangugage = "en";

export enum ImpromptuSpeechRoles {
  TableTopicsEvaluator = "Table Topics Evaluator",

  Scores = "Scores",
  General = "Feedback",
  Report = "Report",

  // Grammarian = "Grammarian",
  // AhCounter = "Ah-Counter",
  // Timer = "Timer",
  // GeneralEvaluator = "General Evaluator",

  RevisedSpeech = "Revised Speech",
  Samplepeech = "Sample Speech",
}

export enum ESpeechScores {
  RelevanceDepth = "Relevance & Depth",
  OrganizationStructure = "Structure",
  LanguageUse = "Language",
  DeliverySkills = "Delivery",
  TimeManagement = "Time",
}

export enum ESpeechModes {
  // interaction
  Free = "Free",
  Interview = "Interview",
  // mode
  Personal = "Personal",
  Hosting = "Hosting",
}

export enum ESpeechStage {
  Start = "",
  Question = "Question",
  Report = "Report",
}

export enum ESpeechStageStatus {
  Start = "",
  Recording = "Recording",
  Paused = "Paused",
  Stopped = "Stopped",
}

// need default value, so class
export class IQuestionItem {
  Question: string = "";
  SampleSpeech: string = "";

  Speech: string = "";
  SpeechTime: number = 0;
  SpeechAudio: string = "";

  Score: number = 0;
  Scores: IScoreMetric[] = [];
  Evaluations: Record<string, string> = {};

  // these 2 should not be reset
  Speaker: string = "";
  StageStatus = ESpeechStageStatus.Start;

  constructor() {}

  // using static method so that it will not lose when refresh page
  public static reset = (item: IQuestionItem): void => {
    item.Speech = "";
    item.SpeechTime = 0;
    item.SpeechAudio = "";
    // item.StageStatus = ESpeechStageStatus.Start;  // change at outside
    item.Score = 0;
    item.Scores = [];
    item.Evaluations = {};
  };
}

export interface IScoreMetric {
  Subject: string;
  Score: number;
  Reason: string;
}

export class ImpromptuSpeechInput {
  ActivePage: string = ESpeechStage.Start;

  // 0: setting, 1: main page
  // ActiveStep: number = 0;
  Topic: string = "";

  HasQuestions: boolean = false;
  QuestionNums: number = 2;
  StartTime: number = new Date().getTime();
  EndTime: number = new Date().getTime();
  TotalEvaluations: Record<string, string> = {};

  Interaction: string = ESpeechModes.Free;
  Mode: string = ESpeechModes.Personal;

  QuestionItems: IQuestionItem[] = [];
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
      ESpeechScores.RelevanceDepth,
      ESpeechScores.OrganizationStructure,
      ESpeechScores.LanguageUse,
      ESpeechScores.DeliverySkills,
      ESpeechScores.TimeManagement,
    ];
  }

  // TODO: when anything is ready, will add this.
  static GetScoreRolesDescription(): string[] {
    return [
      `***${ESpeechScores.RelevanceDepth}***: Assess whether the content is relevant to the topic, whether the information is accurate, and if there is a thorough exploration of the subject`,
      ESpeechScores.OrganizationStructure,
      ESpeechScores.LanguageUse,
      ESpeechScores.DeliverySkills,
      ESpeechScores.TimeManagement,
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
    
    As a highly objective and strict Table Topics Evaluator, provide a detailed score for my speech. The score list should include values between 0 to 100 for each criterion, with significant penalties for speeches that are significantly shorter than the expected length. The criteria are:
    1). ${ESpeechScores.RelevanceDepth}: Evaluate how well the speech addresses the question and explores the subject. Significantly short speeches that do not adequately cover the topic should receive very low scores.
    2). ${ESpeechScores.OrganizationStructure}: Assess the clarity and coherence of the speech. A speech that is too short to have a clear introduction, development, and conclusion should be penalized heavily in scoring.
    3). ${ESpeechScores.LanguageUse}: Consider the choice of vocabulary, grammar correctness, and rhetorical devices. Speeches that are too brief to demonstrate effective language use should receive low scores.
    4). ${ESpeechScores.DeliverySkills}: Evaluate the fluency, clarity, and speaking pace, along with filler words usage. Speeches that are significantly shorter than the expected 2-minute length should be scored lower, as they fail to demonstrate sustained delivery skills.
    
    Your response should be a strict JSON list, with no additional comments, like:
    [
      {
        "Subject": ${ESpeechScores.RelevanceDepth},
        "Score": 80,
        "Reason": "xxx"
      },
      {
        "Subject": ${ESpeechScores.OrganizationStructure},
        "Score": 40,
        "Reason": "xxx"
      },
      {
        "Subject": ${ESpeechScores.LanguageUse},
        "Score": 40,
        "Reason": "xxx"
      },
      {
        "Subject": ${ESpeechScores.DeliverySkills},
        "Score": 40,
        "Reason": "xxx"
      },
    ]
    
    Note: 
    1). Please maintain strict and professional standards in your evaluation. 
    2). The Reason should be a brief 1-2 sentences about your score.    
    `;
  }

  /*
内容的相关性和深度：考察演讲内容是否与主题相关，信息是否准确，是否有深入探讨。
组织结构：评估演讲的开始、发展和结尾是否清晰，思路是否连贯。
语言使用：考察词汇选择、语法结构的正确性，以及是否恰当地使用比喻或其他修辞手法。
表达能力：评价说话的流畅性、清晰度和语速是否适宜。
*/

  static GetSampleSpeechPrompt(currentNum: number, question: string): string {
    return `The No.${currentNum} Question is:
    "${question}",

    Give me a sample impromptu speech.
    You should:
      1). Bold keywords using markdown when present your answer.
      2). Note, your answer should only include speech content, no any extra words.
      3). About 200 words.
    `;
  }

  static GetEvaluationRoles(): string[] {
    return [
      ImpromptuSpeechRoles.General,
      ToastmastersRoles.Grammarian,
      ImpromptuSpeechRoles.RevisedSpeech,
    ];
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
      3). Provide addvice to my lowest scores you provided.
      4). About 100 words.
      `,
      [ToastmastersRoles.Grammarian]: `You are the ${ToastmastersRoles.Grammarian}, to evaluate the speech by 
      considering the choice of vocabulary, grammar correctness, and rhetorical devices.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice.
      4). About 100 words.
      `,
      [ImpromptuSpeechRoles.RevisedSpeech]: `To the No.${currentNum} Question and Speech.

      You are an teacher of Table Topics.
      Help revise, polish and improve my speech,
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). About 200 Words.
      `,
    };
  }

  static GetTotalEvaluationRoles(): string[] {
    return [
      ImpromptuSpeechRoles.Report,
      ImpromptuSpeechRoles.General,
      ToastmastersRoles.Grammarian,
    ];
  }

  static GetHostingTotalEvaluationPrompts(
    questionItems: IQuestionItem[],
  ): Record<string, string> {
    const speakerInputs = [];
    for (const item of questionItems) {
      if (item.Speech !== "") {
        speakerInputs.push({
          Speaker: item.Speaker,
          Question: item.Question,
          Speech: item.Speech,
        });
      }
    }
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);

    return {
      [ImpromptuSpeechRoles.Report]: `The Question-Speech pairs are:
      ${speakerInputsString},

      You are the ${ToastmastersRoles.TableTopicsEvaluator}, Give me a summary report for the Table Topics Session.
      Your should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Not evaluate one by one. Just highlight the good or bad usage of sentence or words.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to the speaker if he has bad usage.
      5). Total report should be about 200 words.
      `,
      [ImpromptuSpeechRoles.General]: `The Question-Speech pairs are:
      ${speakerInputsString},
  
      You are the ${ToastmastersRoles.TableTopicsEvaluator}, Evaluate the speech for all speakers.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Bold keywords using markdown when present your answer.
      4). Provide addvice to the speaker based on his speech.
      5). Each speaker's evaluation should be about 50 words.
      `,
      [ToastmastersRoles.Grammarian]: `You are the ${ToastmastersRoles.Grammarian}, Evaluate the speech for all speakers.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the speaker based on his speech.
      4). Each speaker's evaluation should be about 50 words.
      `,
    };
  }

  static GetPersonalTotalEvaluationPrompts(
    questionItems: IQuestionItem[],
  ): Record<string, string> {
    const speakerInputs = [];
    for (const item of questionItems) {
      if (item.Speech !== "") {
        speakerInputs.push({
          Question: item.Question,
          Speech: item.Speech,
        });
      }
    }
    // 4 是可选的缩进参数，它表示每一层嵌套的缩进空格数
    const speakerInputsString = JSON.stringify(speakerInputs, null, 4);

    return {
      [ImpromptuSpeechRoles.General]: `The Question-Speech pairs are:
      ${speakerInputsString},
  
      You are the ${ToastmastersRoles.TableTopicsEvaluator}, to give me an total evaluation for my speeches.
      Your evaluation should:
      1). Don't evaluate one by one, just the final total evaluation.
      2). Don't make things up, you can quote sentence from my speech.
      3). To bold keywords using markdown when present your answer.
      4). Provide addvice to me based on my speech.
      5). About 200 words.
      `,
      [ToastmastersRoles.Grammarian]: `You are the ${ToastmastersRoles.Grammarian}, to evaluate my speeches.
      Your evaluation should:
      1). Don't evaluate one by one, just the final total grammarian evaluation.
      2). Don't make things up, all your quoted sentence must be from my speech.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to me based on my speech.
      5). About 200 words.
      `,
    };
  }
}
