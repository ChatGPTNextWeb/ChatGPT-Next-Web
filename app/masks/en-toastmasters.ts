export enum ToastmastersRoles {
  ImpromptuSpeaker = 0,
  TableTopicsEvaluator = 1,
}

export const EN_TOASTMASTERS_ROLES = [
  {
    role: "Impromptu Speaker",
    content: `You are the Impromptu Speaker. 
      Question is "{{question}}"`,
  },
  {
    role: "Table Topics Evaluator",
    content: `You are the Table Topics Evaluator. 
    Evaluate your 1st speech.`,
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
