export enum ToastmastersRoles {
  TableTopicsEvaluators = "Table Topics Evaluators",
  TableTopicsEvaluator = "Table Topics Evaluator",
  TableTopicsMaster = "Table Topics Master",
  TableTopicsSpeaker = "Table Topics Speaker",
  IndividualEvaluator = "Individual Evaluator",
  Grammarian = "Grammarian",
  AhCounter = "Ah-Counter",
  GeneralEvaluator = "General Evaluator",
  RevisedSpeech = "Revised Speech",
}

export interface ToastmastersRolePrompt {
  role: string;
  contentWithSetting: (setting: ToastmastersRoleSetting) => string;

  role_index: number; // TODO: remove it
  content: string; // TODO: remove it
  words?: number; // TODO: remove it
}

export class InputSubmitStatus {
  canSubmit: boolean;
  guidance: string;

  constructor(canSubmit: boolean, guidance: string) {
    this.canSubmit = canSubmit;
    this.guidance = guidance;
  }
}

export interface ToastmastersRoleSetting {
  words: number;
}

// 100 words is about 48s speech
export const ToastmastersSettings: Record<string, ToastmastersRoleSetting> = {
  [ToastmastersRoles.TableTopicsEvaluator]: {
    words: 100,
  },
  [ToastmastersRoles.Grammarian]: {
    words: 50,
  },
  [ToastmastersRoles.AhCounter]: {
    words: 50,
  },
  [ToastmastersRoles.RevisedSpeech]: {
    words: 100,
  },
};

export const ToastmastersTTMasterGuidance = (topic: string) => `
The topic is: "${topic}",
Are you ready?
`;

export const ToastmastersTTMaster: ToastmastersRolePrompt[] = [
  {
    role_index: 0,
    role: "Introduction",
    content: `To give an introduction about this topic.
    Your answer must:
    1). About 100 words.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 1,
    role: "Top 10 Questions",
    content: `To give 10 questions about this topic used in table topics session.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 2,
    role: "Advertisement",
    content: `To give an advertisement about this topic.
    Your answer must:
    1). About 100 words.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
];

export const ToastmastersTTSpeakerGuidance = (question: string) => `
The question is: "${question}",
Are you ready to play an role with my guidance?
`;

export const ToastmastersTTSpeaker: ToastmastersRolePrompt[] = [
  {
    role_index: 0,
    role: ToastmastersRoles.TableTopicsSpeaker,
    content: `You are the ${ToastmastersRoles.TableTopicsSpeaker}. 
    Give me an impromptu speech about the question.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 1,
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate your impromptu speech.
    Your evaluation should include the relevance between the Speech and the Question.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 2,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate your impromptu speech.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 3,
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}. 
    Evaluate your impromptu speech.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 4,
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}. 
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
];

export const ToastmastersIEvaluatorGuidance = (
  topic: string,
  speech: string,
) => `
My input is:
{
	"Topic": "${topic}",
	"Speech": "${speech}"
},
Are you ready to play an Evaluator role with my guidance?
`;

export const ToastmastersIEvaluator: ToastmastersRolePrompt[] = [
  {
    role_index: 0,
    role: ToastmastersRoles.IndividualEvaluator,
    content: `You are the ${ToastmastersRoles.IndividualEvaluator}. 
    Evaluate my prepared speech.
    Your evaluation should:
    1). Include the relevance between the Speech and the Topic.
    2). Bold keywords using markdown when present your answer.
    3). About 200 words or 2 minutes.
    `,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 1,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.
    Your evaluation should:
    1). Don't make things up, all your quoted sentence must from my speech.
    2). First give me an accurate number where is the grammar error, and then evaluate my speech.
    3). Bold keywords using markdown when present your answer.
    4). About 100 words.
    `,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 2,
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}.
    Evaluate my speech.
    Your evaluation should:
    1). First give me an accurate number by count the number of filler words and pauses used in my speech, 
    and then evaluate my speech
    2). Bold keywords using markdown when present your answer.
    3). About 100 words.
    `,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
  {
    role_index: 3,
    role: "Revised Speech",
    content: `You are the an teacher of ${ToastmastersRoles.IndividualEvaluator}.
    Help revise, polish and improve my speech.
    You should:
    1). Don't say who you are, just provide your revised speech.
    2). Bold keywords using markdown when present your answer.
    3). About 500 words.
    `,
    contentWithSetting: (setting: ToastmastersRoleSetting) => "",
  },
];

export const ToastmastersTTEvaluatorsGuidance = (input: string) => `
The Question-Speech pairs are:
[
  ${input}
]
Are you ready to answer? If you understand, answer yes.
`;

export const ToastmastersTTEvaluatorsRecord: Record<
  string,
  ToastmastersRolePrompt[]
> = {
  [ToastmastersRoles.TableTopicsEvaluator]: [
    {
      role_index: 0, // not used now
      role: ToastmastersRoles.TableTopicsEvaluator + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      1). Give me a table which presenting the keywords used in each person's speech
      2). Only response the table, 
      3). Do not include any extra description and extra words. 
      `,
    },
    {
      role_index: 1, // role_index is the index of this item in the array
      role: ToastmastersRoles.TableTopicsEvaluator + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      Evaluate the speech for all speakers.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Refer some of the keywords in the table in your evaluation.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to the speaker based on his speech.
      5). Each speaker's evaluation should be about ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.Grammarian]: [
    {
      role_index: 2,
      role: ToastmastersRoles.Grammarian + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      1). Give me a table which presenting the accurate number of grammar errors used in each person's speech,
      2). Only response the table, 
      3). Do not include any extra description and extra words. 
      `,
    },
    {
      role_index: 3,
      role: ToastmastersRoles.Grammarian + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.Grammarian}. 
      Evaluate the speech for all speakers and to analysis your stats in your table. 
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the speaker based on his speech.
      4). Each speaker's evaluation should be about ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.AhCounter]: [
    {
      role_index: 4,
      role: ToastmastersRoles.AhCounter + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      1). Give me a table which presenting the accurate number of filler words and pauses used in each person's speech,
      2). Only response the table,
      3). Do not include any extra description and extra words.
      `,
    },
    {
      role_index: 5,
      role: ToastmastersRoles.AhCounter + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      To analysis your stats in your table.
      You should:
      1). Generate a summary with the Ah-Counter's tone according to the table
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the speaker based on his speech.
      4). Each speaker's evaluation should be about ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.RevisedSpeech]: [
    {
      role_index: 3,
      role: "Revised Speech",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the an teacher of ${ToastmastersRoles.TableTopicsSpeaker}.
      Help revise, polish and improve the speech for all speakers.
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). Each speaker's evaluation should be about ${setting.words} words.
      `,
    },
  ],
};

export const ToastmastersTTEvaluatorGuidance = (
  question: string,
  speech: string,
) => `
My input is:
{
	"Question": "${question}",
	"Speech": "${speech}"
},
Are you ready to play an Evaluator role with my guidance?
`;

export const ToastmastersTTEvaluatorRecord: Record<
  string,
  ToastmastersRolePrompt[]
> = {
  [ToastmastersRoles.TableTopicsEvaluator]: [
    {
      role_index: 0, // not used now
      role: ToastmastersRoles.TableTopicsEvaluator + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      1). Give me a table which presenting the keywords used in my speech
      2). Only response the table, 
      3). Do not include any extra description and extra words. 
      `,
    },
    {
      role_index: 1, // role_index is the index of this item in the array
      role: ToastmastersRoles.TableTopicsEvaluator + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      Evaluate my speech.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Refer some of the keywords in the table in your evaluation.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to me based on my speech.
      5). About ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.Grammarian]: [
    {
      role_index: 2,
      role: ToastmastersRoles.Grammarian + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      1). Give me a table which presenting the accurate number of grammar errors used in my speech,
      2). Only response the table, 
      3). Do not include any extra description and extra words. 
      `,
    },
    {
      role_index: 3,
      role: ToastmastersRoles.Grammarian + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.Grammarian}. 
      Evaluate my speech and analysis your stats in your table. 
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to me based on my speech.
      4). About ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.AhCounter]: [
    {
      role_index: 4,
      role: ToastmastersRoles.AhCounter + "-Count",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      1). Give me a table which presenting the accurate number of filler words and pauses used in my speech,
      2). Only response the table,
      3). Do not include any extra description and extra words.
      `,
    },
    {
      role_index: 5,
      role: ToastmastersRoles.AhCounter + "-Evaluation",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      To analysis your stats in your table.
      You should:
      1). Generate a summary with the Ah-Counter's tone according to the table
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to to based on my speech.
      4). About ${setting.words} words.
      `,
    },
  ],
  [ToastmastersRoles.RevisedSpeech]: [
    {
      role_index: 3,
      role: "Revised Speech",
      content: `
      `,
      contentWithSetting: (setting: ToastmastersRoleSetting) =>
        `You are the an teacher of ${ToastmastersRoles.TableTopicsSpeaker}.
      Help revise, polish and improve my speech.
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). About ${setting.words} words.
      `,
    },
  ],
};
