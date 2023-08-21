export enum ToastmastersRoles {
  ImpromptuSpeaker = "Impromptu Speaker",
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

export const ToastmastersTTMaster = [
  {
    role: "Introduction",
    content: `To give an introduction about this topic.
    Your answer must:
    1). About 100 words.`,
  },
  {
    role: "Advertisement",
    content: `To give an advertisement about this topic.
    Your answer must:
    1). About 100 words.`,
  },
  {
    role: "Top 10 Questions",
    content: `To give 10 questions about this topic used in table topics session.`,
  },
];

export const ToastmastersTTSpeakerGuidance = (question: string) => `
The question is: "${question}",
Are you ready to play an role with my guidance?
`;

export const ToastmastersTTSpeaker = [
  {
    role: ToastmastersRoles.ImpromptuSpeaker,
    content: `You are the ${ToastmastersRoles.ImpromptuSpeaker}. 
    Give me an impromptu speech about the question.`,
  },
  {
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate your impromptu speech.
    Your evaluation should include the relevance between the Speech and the Question.`,
  },
  {
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate your impromptu speech.`,
  },
  {
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}. 
    Evaluate your impromptu speech.`,
  },
  {
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}. 
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
  },
];

export const ToastmastersEvaluatorGuidance = (
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

export const ToastmastersEvaluators = [
  {
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my impromptu speech.
    Your evaluation should include the relevance between the Speech and the Question.`,
  },
  {
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.`,
  },
  {
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}.
    Evaluate my speech.`,
  },
  {
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
  },
];

export const ToastmastersTableTopicsEvaluators: ToastmastersRolePrompt[] = [
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

// export const ToastmastersTableTopicsEvaluatorRecord: Record<string, ToastmastersRolePrompt> = {
//   [ToastmastersRoles.TableTopicsEvaluator]:
//   {
//     role: ToastmastersRoles.TableTopicsEvaluator,
//     content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}.
//     Evaluate my impromptu speech.
//     Your evaluation should include the relevance between the Speech and the Question.`,
//   },

//   [ToastmastersRoles.Grammarian]:
//   {
//     role: ToastmastersRoles.Grammarian,
//     content: `You are the ${ToastmastersRoles.Grammarian}.
//     Evaluate my speech.`,
//   },

//   [ToastmastersRoles.AhCounter]:
//   {
//     role: ToastmastersRoles.AhCounter,
//     content: `You are the ${ToastmastersRoles.AhCounter}.
//     Evaluate my speech.`,
//   },

//   [ToastmastersRoles.GeneralEvaluator]:
//   {
//     role: ToastmastersRoles.GeneralEvaluator,
//     content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
//     Evaluate the above 3 roles' speech,
//     including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
//   },
// };

export const ToastmastersIndividualEvaluatorGuidance = (
  question: string,
  speech: string,
) => `
My input is:
{
	"Topic": "${question}",
	"Speech": "${speech}"
},
Are you ready to play an Evaluator role with my guidance?
`;

export const ToastmastersIndividualEvaluators = [
  {
    role: ToastmastersRoles.IndividualEvaluator,
    content: `You are the ${ToastmastersRoles.IndividualEvaluator}. 
    Evaluate my prepared speech.
    Your evaluation should include the relevance between the Speech and the Topic.
    Your evaluation should be about 2 minutes and 200 words`,
  },
  {
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.`,
  },
  {
    role: ToastmastersRoles.AhCounter,
    content: `You are the ${ToastmastersRoles.AhCounter}.
    Evaluate my speech.`,
  },
  {
    role: ToastmastersRoles.GeneralEvaluator,
    content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
    Evaluate the above 3 roles' speech,
    including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
  },
];
