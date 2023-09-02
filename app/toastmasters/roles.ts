export enum ToastmastersRoles {
  TableTopicsSpeaker = "Table Topics Speaker",
  TableTopicsEvaluator = "Table Topics Evaluator",
  IndividualEvaluator = "Individual Evaluator",
  Grammarian = "Grammarian",
  AhCounter = "Ah-Counter",
  GeneralEvaluator = "General Evaluator",
}

export interface ToastmastersRolePrompt {
  role_index: number;
  role: string;
  content: string;
  words?: number;
}

export class InputSubmitStatus {
  canSubmit: boolean;
  guidance: string;

  constructor(canSubmit: boolean, guidance: string) {
    this.canSubmit = canSubmit;
    this.guidance = guidance;
  }
}

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
  },
  {
    role_index: 1,
    role: "Top 10 Questions",
    content: `To give 10 questions about this topic used in table topics session.`,
  },
  {
    role_index: 2,
    role: "Advertisement",
    content: `To give an advertisement about this topic.
    Your answer must:
    1). About 100 words.`,
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
  },
  {
    role_index: 1,
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate your impromptu speech.
    Your evaluation should include the relevance between the Speech and the Question.`,
  },
  {
    role_index: 2,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate your impromptu speech.`,
  },
  {
    role_index: 3,
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}. 
    Evaluate your impromptu speech.`,
  },
  {
    role_index: 4,
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}. 
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
  },
];

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

export const ToastmastersTTEvaluator: ToastmastersRolePrompt[] = [
  {
    role_index: 0, // role_index is the index of this item in the array
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my impromptu speech.
    Your evaluation should:
    1). Include the relevance between the Speech and the Question.
    2). Bold keywords using markdown when present your answer.
    3). About 100 words.
    `,
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
  },
  // {
  //   role_index: 3,
  //   role: ToastmastersRoles.GeneralEvaluator,
  //   content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
  //   Evaluate the above 3 roles' speech,
  //   including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.
  //   Your answer must:
  //   1). Briefly answer within 100 words.
  // 2). Highlight your keypoint when present your answer.
  //   `,
  // },
  {
    role_index: 3,
    role: "Revised Speech",
    content: `You are the an teacher of ${ToastmastersRoles.TableTopicsSpeaker}.
    Help revise, polish and improve my speech.
    You should:
    1). Don't say who you are, just provide your revised speech.
    2). Bold keywords using markdown when present your answer.
    3). About 100 words.
    `,
  },
];

// TODO: start
export class ToastmastersRoleSetting {
  words: number = 100;
}

class ToastmastersTTEvaluatorClass {
  Guidance = (question: string, speech: string) => `
      My input is:
      {
        "Question": "${question}",
        "Speech": "${speech}"
      },
      Are you ready to play an Evaluator role with my guidance?
      `;

  TableTopicsEvaluator = (props: ToastmastersRoleSetting) =>
    `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my impromptu speech.
    Your evaluation should:
    1). Include the relevance between the Speech and the Question.
    2). Bold keywords using markdown when present your answer.
    3). About ${props.words} words.
    `;
}
export const toastmastersTTEvaluatorClass = new ToastmastersTTEvaluatorClass();

export const ToastmastersTTEvaluatorConst = {
  Guidance: (question: string, speech: string) => `
      My input is:
      {
        "Question": "${question}",
        "Speech": "${speech}"
      },
      Are you ready to play an Evaluator role with my guidance?
      `,

  TableTopicsEvaluator: (props: ToastmastersRoleSetting) =>
    `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my impromptu speech.
    Your evaluation should:
    1). Include the relevance between the Speech and the Question.
    2). Bold keywords using markdown when present your answer.
    3). About ${props.words} words.
    `,

  Grammarian: (props: ToastmastersRoleSetting) =>
    `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.
    Your evaluation should:
    1). Don't make things up, all your quoted sentence must from my speech.
    2). First give me an accurate number where is the grammar error, and then evaluate my speech.
    3). Bold keywords using markdown when present your answer.
    4). About ${props.words} words.
    `,
};
// TODO: end

export const ToastmastersTableTopicsEvaluatorRecord: Record<
  string,
  ToastmastersRolePrompt
> = {
  [ToastmastersRoles.TableTopicsEvaluator]: {
    role_index: 0, // role_index is the index of this item in the array
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my impromptu speech.
    Your evaluation should:
    1). Include the relevance between the Speech and the Question.
    2). Bold keywords using markdown when present your answer.
    3). About 100 words.
    `,
    words: 100,
  },

  [ToastmastersRoles.Grammarian]: {
    role_index: 1,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}.
    Evaluate my speech.`,
    words: 100,
  },
};

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
  },
];

export const ToastmastersAhCounterGuidance = (input: string) => `
The Question-Speech pairs are:
[
  ${input}
]
Are you ready to answer? If you understand, answer yes.
`;

export const ToastmastersAhCounter: ToastmastersRolePrompt[] = [
  {
    role_index: 0, // role_index is the index of this item in the array
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate the speech for all speakers.
    Your evaluation should:
    1). Bold keywords using markdown when present your answer.
    2). Each speaker's evaluation should be about 50 words.
    `,
  },
  {
    role_index: 1,
    role: ToastmastersRoles.Grammarian + "-Count",
    content: `You are the ${ToastmastersRoles.Grammarian}.
    1). Give me a table which presenting the accurate number of grammar errors used in each person's speech,
    2). Only response the table, 
    3). Do not include any extra description and extra words. 
    `,
  },
  {
    role_index: 2,
    role: ToastmastersRoles.Grammarian + "-Analysis",
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate the speech for all speakers.
    and to analysis your stats in your table. 
    Your evaluation should:
    1). Don't make things up, all your quoted sentence must from the speaker's speech.
    2). Bold keywords using markdown when present your answer.
    3). Provide addvice to the speaker.
    4). Each speaker's evaluation should be about 50 words.
    `,
  },
  {
    role_index: 3,
    role: ToastmastersRoles.AhCounter + "-Count",
    content: ` 
    You are the ${ToastmastersRoles.AhCounter}. 
    1). Give me a table which presenting the accurate number of filler words and pauses used in each person's speech,
    2). Only response the table, 
    3). Do not include any extra description and extra words. 
    `,
  },
  {
    role_index: 4,
    role: ToastmastersRoles.AhCounter + "-Analysis",
    content: ` 
    You are the ${ToastmastersRoles.AhCounter}. 
    To analysis your stats in your table. 
    You should:
    1). Generate a summary with the Ah-Counter's tone according to the table
    2). Bold keywords using markdown when present your answer.
    3). Each speaker's evaluation should be about 50 words.
    `,
  },
];
