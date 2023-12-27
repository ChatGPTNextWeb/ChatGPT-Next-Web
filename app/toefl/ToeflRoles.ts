import { InputStore } from "../store";
import { IScoreMetric } from "../toastmasters/ISpeechRoles";

// TODO:
export const SpeechDefaultLangugage = "en";

export enum EToeflRoles {
  IntegratedWriting = "Integrated Writing Master",
  AcademicDiscussion = "Academic Discussion",

  // Evaluations
  Scores = "得分",
  TotalScore = "综合得分",
  SubScore = "子项得分",
  GeneralFeedback = "综合评语",
  RevisedWriting = "语法纠正",
  SampleWriting = "5分范文",

  // Scores
  LanguageFacility = "Language Facility",
  GrammarAndAccuracy = "Grammar and Accuracy",
  SyntacticAndVocabularyRange = "Syntactic and Vocabulary Range",
  OriginalLanguage = "Original Language",
  CoherenceAndFlow = "Coherence and Flow",
  ClarityAndSupport = "Clarity and Support",
  InformationExtractionOfreading = "information extraction of reading",
  InformationExtractionOfListening = "information extraction of listening",
  LogicRelationBetweenReadingAndListening = "Logic relation between reading and listening",
}

export class ToeflWritingInput {
  // TODO:
  Reading: InputStore = new InputStore();
  Listening: InputStore = new InputStore();
  Writing: InputStore = new InputStore();

  Score: number = 0;
  Scores: IScoreMetric[] = [];
  EvaluationGeneral: string = "";
  Evaluations: Record<string, string> = {};
}

export class ToeflWritingPrompts {
  static GetScoreRoles(): string[] {
    return [
      EToeflRoles.LanguageFacility,
      EToeflRoles.GrammarAndAccuracy,
      EToeflRoles.SyntacticAndVocabularyRange,
      EToeflRoles.OriginalLanguage,
      EToeflRoles.ClarityAndSupport,
      EToeflRoles.InformationExtractionOfreading,
      EToeflRoles.InformationExtractionOfListening,
      EToeflRoles.LogicRelationBetweenReadingAndListening,
    ];
  }

  static GetGuidance(
    Reading: string,
    Listening: string,
    Writing: string,
  ): string {
    return `The integrated writing materials are:
    {
    "Reading": "${Reading}",
    "Lecture": "${Listening}",
    "User Writing": "${Writing}"
    },

    Next, I will let you answner my request, are you ready to guide me? 
    Just Answer: Yes or No.
    `;
  }

  static GetScorePrompt(): string {
    return `
    As a highly objective and strict TOEFL writing teacher, please provide a detailed score for User Writing According to the following Official Score Standards. 
    The score list should include values between 1 to 5 for each criterion, with significant penalties for User Writing that are significantly shorter than the expected length 150. The criteria are:
    ${this.GetScoreRoles()}
    
    This is the Official Score Standards:
    1). ***Score 5***: A response at this level successfully selects the important information from the lecture and coherently and accurately presents this information in relation to the relevant information presented in the reading. The response is well organized, and occasional language errors that are present do not result in inaccurate or imprecise presentation of content or connections.
    2). ***Score 4***: A response at this level is generally good in selecting the important information from the lecture and in coherently and accurately presenting this information in relation to the relevant information in the reading, but it may have minor omission, inaccuracy, vagueness, or imprecision of some content from the lecture or in connection to points made in the reading. A response is also scored at this level if it has more frequent or noticeable minor language errors, as long as such usage and grammatical structures do not result in anything more than an occasional lapse of clarity or in the connection of ideas.
    3). ***Score 3***: A response at this level contains some important information from the lecture and conveys some relevant connection to the reading, but it is marked by one or more of the following:
      * Although the overall response is definitely oriented to the task, it conveys only vague, global, unclear, or somewhat imprecise connection of the points made in the lecture to points made in the reading. 
      * The response may omit one major key point made in the lecture. 
      * Some key points made in the lecture or the reading, or connections between the two, maybe incomplete, inaccurate, or imprecise. 
      * Errors of usage and/or grammar may be more frequent or may result in noticeably vague expressions or obscured meanings in conveying ideas and connections. 
    4). ***Score 2***: A response at this level contains some relevant information from the lecture, but is marked by significant language difficulties or by significant omission or inaccuracy of important ideas from the lecture or in the connections between the lecture and the reading; a response at this level is marked by one or more of the following:
      * The response significantly misrepresents or completely omits the overall connection between the lecture and the reading. 
      * The response significantly omits or significantly misrepresents important points made in the lecture. 
      * The response contains language errors or expressions that largely obscure connections or meaning at key junctures or that would likely obscure understanding of key ideas for a reader not already familiar with the reading and the lecture. 
    5). ***Score 1***: A response at this level is marked by one or more of the following:
      * The response provides little or no meaningful or relevant coherent content from the lecture. 
      * The language level of the response is so low that it is difficult to derive meaning. 

    Your response should be a strict JSON list, with no additional comments, like:
    [
      {
        "Subject": ${EToeflRoles.LanguageFacility},
        "Score": 2,
        "Reason": "xxx"
      },
      {
        "Subject": ${EToeflRoles.GrammarAndAccuracy},
        "Score": 3,
        "Reason": "xxx"
      },
      ...
    ]

    Note: 
    1). Please maintain strict and professional standards in your evaluation. 
    `;
  }

  static GetGeneralFeedbackPrompt(): string {
    return `
      根据你的打分, 给出综合评语，大概100字，用中文
      `;
  }

  static GetEvaluationRoles(): string[] {
    return [
      // EToeflRoles.GeneralFeedback,
      EToeflRoles.RevisedWriting,
      EToeflRoles.SampleWriting,
    ];
  }

  static GetEvaluationPrompts(): Record<string, string> {
    return {
      // [EToeflRoles.RevisedWriting]: `
      // The Official Score Standards of Score 5: response at this level successfully selects the important information from the lecture and coherently and accurately presents this information in relation to the relevant information presented in the reading. The response is well organized, and occasional language errors that are present do not result in inaccurate or imprecise presentation of content or connections.

      // According to this standard, To help revise User Writing.
      // Note: Only give the Revised Writing, No other descriptions.
      // `,
      /*
      Please use markdwon format to keep traces of changes like Git.
      For example, when a word needs to be replaced, it would be:
      Original Writing: However, listening have different ideas.
      Revised Writing: However, ~~listening~~ listening~~ have~~ has different idea.
      */

      [EToeflRoles.RevisedWriting]: `
      官方5分标准: response at this level successfully selects the important information from the lecture and coherently and accurately presents this information in relation to the relevant information presented in the reading. The response is well organized, and occasional language errors that are present do not result in inaccurate or imprecise presentation of content or connections.

      根据此标准, 逐句批注和修改。要写清楚原来的句子哪里错了？为什么错？应该怎么写才是对的？
      请记住, 学生是中国人, 批注和解释 用中文
      `,

      [EToeflRoles.SampleWriting]: `
      The Official Score Standards of Score 5：A response at this level successfully selects the important information from the lecture and coherently and accurately presents this information in relation to the relevant information presented in the reading. The response is well organized, and occasional language errors that are present do not result in inaccurate or imprecise presentation of content or connections.

      According to this standard, to give Sample Writing of Score 5.
      Note: Only output Sample Writing, No other descriptions.
      `,
    };
  }
}
