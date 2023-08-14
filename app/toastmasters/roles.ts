export enum ToastmastersRoles {
  ImpromptuSpeaker = "Impromptu Speaker",
  TableTopicsEvaluator = "Table Topics Evaluator",
  Grammarian = "Grammarian",
  AhCounter = "Ah-Counter",
  GeneralEvaluator = "General Evaluator",
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
