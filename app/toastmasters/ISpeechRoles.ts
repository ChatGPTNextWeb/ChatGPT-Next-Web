import {
  AudioRecorder,
  StageStatus,
} from "../cognitive/speech-audioRecorderClass";
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

  StageStatus = StageStatus.Start;
  // Recorder: AudioRecorder = new AudioRecorder();

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
  StartTime: number = new Date().getTime();
  EndTime: number = new Date().getTime();
  TotalEvaluations: string = ""; // TODO: might be Record<string, string>

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
    
    As a highly objective and strict Table Topics Evaluator, provide a detailed score for my speech. The score list should include values between 0 to 100 for each criterion, with significant penalties for speeches that are significantly shorter than the expected length. The criteria are:
    
    1). Relevance and Depth of Content: Evaluate how well the speech addresses the question and explores the subject. Significantly short speeches that do not adequately cover the topic should receive very low scores.
    
    2). Organization and Structure: Assess the clarity and coherence of the speech. A speech that is too short to have a clear introduction, development, and conclusion should be penalized heavily in scoring.
    
    3). Language Use: Consider the choice of vocabulary, grammar correctness, and rhetorical devices. Speeches that are too brief to demonstrate effective language use should receive low scores.
    
    4). Delivery Skills: Evaluate the fluency, clarity, and speaking pace, along with filler words usage. Speeches that are significantly shorter than the expected 2-minute length should be scored lower, as they fail to demonstrate sustained delivery skills.
    
    The scoring format should be a JSON list with the scores for each criterion, with no additional comments. For example: [20, 40, 30, 50].
    
    Note: Please maintain strict and professional standards in your evaluation. The length of the speech should be a significant factor in scoring, with very short speeches receiving lower scores to reflect their limited content and delivery.`;
  }

  static GetScorePrompt2(
    currentNum: number,
    question: string,
    speech: string,
  ): string {
    return `The No.${currentNum} Question and Speech are:
    {
    "Question": "${question}",
    "Speech": "${speech}"
    },
    
    As a highly objective and strict Table Topics Evaluator, please provide a detailed score for my speech, considering both the quality and the length of the speech. The score list should consist of values between 0 to 100 for each of the following criteria. Speeches significantly shorter than the expected 2 minutes or 200 words should receive lower scores. The criteria are:
    
    1). Relevance and Depth of Content: Evaluate the speech's relevance to the question and the depth of subject exploration. Off-topic, superficial, or overly brief content should be scored low.
    
    2). Organization and Structure: Assess the speech's organization and clarity. Disorganized, unclear, or excessively brief speeches that fail to adequately develop ideas should be penalized.
    
    3). Language Use: Consider the choice of vocabulary, grammar correctness, and rhetorical devices. Penalize poor language use, grammatical errors, and speeches that are too short to demonstrate language proficiency.
    
    4). Delivery Skills: Evaluate fluency, clarity, speaking pace, and the use of filler words. Also, consider the overall duration of the speech. Frequent use of filler words, pauses, or speeches that are too brief to demonstrate effective delivery skills should result in a lower score.
    
    The scoring format should be a JSON list with the scores for each criterion, with no additional comments. For example: [20, 40, 30, 50].
    
    Note: Please maintain strict and professional standards in your evaluation. Scores should be given based on the actual content, delivery, and length of the speech, with a critical and unbiased approach.
    `;
  }

  static GetScorePrompt1(
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

  static GetTotalEvaluationPrompt(questionItems: IQuestionItem[]): string {
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

    return `
    The Question-Speech pairs are:
    ${speakerInputsString},

    You are the ${ToastmastersRoles.TableTopicsEvaluator}, to give me an total evaluation for my speeches.
    Your evaluation should:
    1). Don't evaluate one by one, just the final total evaluation.
    2). Don't make things up, you can quote sentence from my speech.
    3). To bold keywords using markdown when present your answer.
    4). Provide addvice to me based on my speech.
    5). About 200 words.
    `;
  }
}
