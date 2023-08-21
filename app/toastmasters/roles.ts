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
    Your evaluation should include the relevance between the Speech and the Question.`,
  },
  {
    role_index: 1,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.`,
  },
  {
    role_index: 2,
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}.
    Evaluate my speech.`,
  },
  {
    role_index: 3,
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
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
    Your evaluation should include the relevance between the Speech and the Topic.
    Your evaluation should be about 2 minutes and 200 words`,
  },
  {
    role_index: 1,
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.
    Your answer must:
    1). Briefly answer within 100 words.`,
  },
  {
    role_index: 2,
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}.
    Evaluate my speech.
    Your answer must:
    1). Briefly answer within 100 words.`,
  },
  {
    role_index: 3,
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.IndividualEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.
    Your answer must:
    1). Briefly answer within 100 words.`,
  },
];
