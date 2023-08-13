export enum ToastmastersRoles {
  ImpromptuSpeaker = "Impromptu Speaker",
  TableTopicsEvaluator = "Table Topics Evaluator",
  Grammarian = "Grammarian",
  AhCounter = "Ah-Counter",
  GeneralEvaluator = "General Evaluator",
}

export const ToastmastersEvaluators = [
  {
    role: ToastmastersRoles.TableTopicsEvaluator,
    content: `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
    Evaluate my speech. Your evaluation should include the relevance between the Topic and the Speech.`,
  },
  {
    role: ToastmastersRoles.Grammarian,
    content: `You are the ${ToastmastersRoles.Grammarian}. 
    Evaluate my speech.`,
  },
  // {
  //   role: ToastmastersRoles.AhCounter,
  //   content: `You are the ${ToastmastersRoles.AhCounter}.
  //   Evaluate my speech.`,
  // },
  // {
  //   role: ToastmastersRoles.GeneralEvaluator,
  //   content: `You are the ${ToastmastersRoles.GeneralEvaluator}.
  //   Evaluate the above 3 roles' speech,
  //   including ${ToastmastersRoles.TableTopicsEvaluator}, ${ToastmastersRoles.Grammarian}, and ${ToastmastersRoles.AhCounter}.`,
  // },
];

export const ToastmastersEvaluatorGuidance = (
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

export const EN_TOASTMASTERS_ROLES = [
  {
    role: "Impromptu Speaker",
    content: `You are the Impromptu Speaker. 
      Question is "{{question}}"`,
  },
  {
    role: "Table Topics Evaluator",
    content: `You are the Table Topics Evaluator. 
    Evaluate your 1st speech.
    Your evaluation should include the relevance between the speech and the question.`,
  },
  {
    role: "Grammarian",
    content: `You are the Grammarian. 
    Evaluate your 1st speech.`,
  },
  {
    role: "Ah-Counter",
    content: `You are the Ah-Counter. 
    Evaluate your 1st speech.`,
  },
  {
    role: "General Evaluator",
    content: `You are the General Evaluator. 
    Evaluate the above 4 roles speech.`,
  },
];
