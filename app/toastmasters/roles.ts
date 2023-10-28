import { ILightsTime } from "../store";

export enum ToastmastersRoles {
  Toastmasters = "Toastmasters",
  TableTopicsMaster = "Table Topics Master",
  TableTopicsEvaluator = "Table Topics Evaluator",
  ImpromptuSpeechEvaluator = "Impromptu Speech Evaluator",
  PreparedSpeechEvaluator = "Prepared Speech Evaluator",

  // TableTopicsEvaluators = "Table Topics Evaluators",
  // TableTopicsSpeaker = "Table Topics Speaker",
  // IndividualEvaluator = "Prepared Speech Evaluator",
  Grammarian = "Grammarian",
  AhCounter = "Ah-Counter",
  Timer = "Timer",
  GeneralEvaluator = "General Evaluator",

  RevisedSpeech = "Revised Speech",
  DemoSpeech = "Demo Speech",
  Guidance = "Guidance",

  Introduction = "Introduction",
  Advertisement = "Advertisement",
  Top10Questions = "Top 10 Questions",
}

export const speakersTimeRecord: Record<string, ILightsTime> = {
  ["TableTopicsSpeaker(1-2min)"]: { Green: 1, Yellow: 1.5, Red: 2 },
  ["TableTopicsEvaluator(4-6min)"]: { Green: 4, Yellow: 5, Red: 6 },
  ["PreparedSpeaker(5-7min)"]: { Green: 5, Yellow: 6, Red: 7 },
  ["PreparedSpeechEvaluator(2-3min)"]: { Green: 2, Yellow: 2.5, Red: 3 },
  ["GeneralEvaluator(4-6min)"]: { Green: 4, Yellow: 5, Red: 6 },
  ["Grammarian(1-2min)"]: { Green: 1, Yellow: 1.5, Red: 2 },
  ["Ah-Counter(1-2min)"]: { Green: 1, Yellow: 1.5, Red: 2 },
  ["CustomTime"]: { Green: 0, Yellow: 0, Red: 0 },
};

export const ToastmastersRolesResponsibilities: Record<string, string> = {
  [ToastmastersRoles.TableTopicsEvaluator]: `
  - ***Evaluate*** the impromptu speeches given by Table Topics Speakers.
  - ***Provide constructive feedback*** on the speaker's ability to think on their feet, coherence, and communication skills during impromptu speeches.
  `,
  [ToastmastersRoles.TableTopicsMaster]: `
  - Conduct the Table Topics session by presenting impromptu speaking topics or questions.
  - Ensure that Table Topics Speakers have a chance to respond to the topics.
  - May offer brief commentary or insights on the Table Topics session.
  `,
  // [ToastmastersRoles.TableTopicsSpeaker]: `
  // - Respond to impromptu speaking topics or questions posed by the Table Topics Master.
  // - Deliver a short, unprepared speech (usually 1-2 minutes) on the given topic.
  // `,
  [ToastmastersRoles.PreparedSpeechEvaluator]: `
  - Evaluate the prepared speeches given by members based on specific criteria and objectives for each speech project.
  - Offer constructive feedback on speech content, organization, and delivery.
  `,
  [ToastmastersRoles.Grammarian]: `
  - Listen for good and poor use of language, grammar, and vocabulary during the meeting.
  - Share feedback on language usage and introduce a "word of the day" to encourage members to expand their vocabulary.
  `,
  [ToastmastersRoles.AhCounter]: `
  - Listen for filler words (e.g., "um," "ah," "like") and other speech habits used by speakers.
  - Report on the number of times each speaker used such fillers.
  `,
  [ToastmastersRoles.GeneralEvaluator]: `
  - Evaluate the overall conduct of the meeting.
  - Provide feedback on the meeting's organization, time management, and leadership.
  - Acknowledge the performance of other evaluators and functionaries.
  `,
  [ToastmastersRoles.RevisedSpeech]: `
  - Help revise, polish and improve the speech according to speaker's speech.
  `,
  [ToastmastersRoles.DemoSpeech]: `
  - To give a demo impromptu speech only according to the question, not related to the speaker's speech.
  `,
  [ToastmastersRoles.Guidance]: `
  - Guidance.
  `,
  [ToastmastersRoles.Introduction]: `
  - An introduction about the topic.
  `,
  [ToastmastersRoles.Advertisement]: `
  - An advertisement about the topic.
  `,
  [ToastmastersRoles.Top10Questions]: `
  - Top 10 Questions about the topic.
  `,
};

export interface ToastmastersRoleSetting {
  words: number;
  // guidance?: string
}

export interface ToastmastersRolePrompt {
  role: string;
  contentWithSetting: (setting?: ToastmastersRoleSetting) => string;
  setting?: ToastmastersRoleSetting;
}

export class InputSubmitStatus {
  canSubmit: boolean;
  guidance: string;

  constructor(canSubmit: boolean, guidance: string) {
    this.canSubmit = canSubmit;
    this.guidance = guidance;
  }
}

// use to generate the settings for each role
export const ToastmastersSettings = (
  ToastmastersRecord: Record<string, ToastmastersRolePrompt[]>,
) => {
  const settings: Record<string, ToastmastersRoleSetting> = {};
  Object.values(ToastmastersRecord).forEach((prompts) => {
    prompts.forEach((prompt) => {
      if (prompt.setting) settings[prompt.role] = { ...prompt.setting };
    });
  });
  return settings;
};

/*
100 words = 48s speech => AvatarVideoGeneratingTime = 4 miniutes = 240 seconds
1 word => 2.4 seconds

100 words = 1$ = 7.2 RMB = 72 Coins
1 words => 0.7 Coins
*/

export const TTMasterGuidance = (topic: string) => `
The topic is: "${topic}",
Are you ready?
`;

export const TTMasterRecord: Record<string, ToastmastersRolePrompt[]> = {
  [ToastmastersRoles.Introduction]: [
    {
      role: ToastmastersRoles.Introduction,
      contentWithSetting: (setting?) =>
        `
      To give an introduction about this topic.
      Your answer must:
      1). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.Top10Questions]: [
    {
      role: ToastmastersRoles.Top10Questions,
      contentWithSetting: (setting?) =>
        `To give 10 questions about this topic used in table topics session.`,
    },
  ],
  [ToastmastersRoles.Advertisement]: [
    {
      role: ToastmastersRoles.Advertisement,
      contentWithSetting: (setting?) =>
        `To give an advertisement about this topic.
      Your answer must:
      1). About ${setting?.words} words.`,
      setting: {
        words: 100,
      },
    },
  ],
};

export const TTEvaluatorGuidance = (input: string) => `
The Question-Speech pairs are:
${input},
Are you ready to answer? If you understand, answer yes.
`;

export const TTEvaluatorRecord: Record<string, ToastmastersRolePrompt[]> = {
  [ToastmastersRoles.TableTopicsEvaluator]: [
    // {
    //   role: ToastmastersRoles.TableTopicsEvaluator + "-Count",
    //   contentWithSetting: (setting?) =>
    //     `You are the ${ToastmastersRoles.TableTopicsEvaluator}.
    //   1). Give me a table which presenting the keywords used in each person's speech
    //   2). Only response the table,
    //   3). Do not include any extra description and extra words.
    //   `,
    // },
    {
      role: ToastmastersRoles.TableTopicsEvaluator + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      Evaluate the speech for all speakers.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Refer some of the keywords in the table in your evaluation.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to the speaker based on his speech.
      5). Each speaker's evaluation should be about ${setting?.words} words.
      `,
      setting: {
        words: 50,
      },
    },
  ],
  [ToastmastersRoles.Grammarian]: [
    {
      role: ToastmastersRoles.Grammarian + "-Count",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      1). Give me a table which presenting the accurate number of grammar errors used in each person's speech.
      2). Only response the table, the Speaker in your table should be equal to the number of input i provide you.
      3). Do not include any extra description and extra words.
      `,
      // contentWithSetting: (setting?) =>
      // `
      // You are the ${ToastmastersRoles.Grammarian}.
      // 1). For each speaker, list the number of his grammar errors first.
      // 2). Then list out an error list table for each speaker.
      // 3). List all of the specific errors you find in the speaker's speech followed by the corresponding right format. List errors using the complete sentence where the error appears.
      // 4). Don't appear Unknown Error. The number of rows should be equal to the number of grammar errors.
      // `,
    },
    {
      role: ToastmastersRoles.Grammarian + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      Evaluate the speech for all speakers and to analysis your stats in your table.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the speaker's speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the speaker based on his speech.
      4). Each speaker's evaluation should be about ${setting?.words} words.
      `,
      setting: {
        words: 50,
      },
    },
  ],
  [ToastmastersRoles.AhCounter]: [
    {
      role: ToastmastersRoles.AhCounter + "-Count",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      1). Give me a table which presenting the accurate number of filler words and pauses used in each person's speech,
      2). Only response the table,
      3). Do not include any extra description and extra words.
      `,
    },
    {
      role: ToastmastersRoles.AhCounter + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      To analysis your stats in your table.
      You should:
      1). Generate a summary with the Ah-Counter's tone according to the table
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the speaker based on his speech.
      4). Each speaker's evaluation should be about ${setting?.words} words.
      `,
      setting: {
        words: 50,
      },
    },
  ],
  // [ToastmastersRoles.RevisedSpeech]: [
  //   {
  //     role: "Revised Speech",
  //     contentWithSetting: (setting?) =>
  //       `You are the an teacher of ${ToastmastersRoles.TableTopicsSpeaker}.
  //     Help revise, polish and improve the speech for all speakers.
  //     You should:
  //     1). Don't say who you are, just provide your revised speech.
  //     2). Bold keywords using markdown when present your answer.
  //     3). Each speaker's evaluation should be about ${setting?.words} words.
  //     `,
  //     setting: {
  //       words: 100,
  //     },
  //   },
  // ],
  [ToastmastersRoles.Timer]: [
    {
      role: ToastmastersRoles.Timer,
      contentWithSetting: (setting?) =>
        `You are the an teacher of ${ToastmastersRoles.Timer}.
      Help evaluate all apekers' time usage. And give addvice for his/her speech.
      For each speaker, GreenTime=01:00, YellowTime=01:30, RedTime=02:00, MaxTime=02:30.
      You should:
      1). if (SpeechTime > MaxTime): it's overtime, to list where can be shorten down.
          else if (SpeechTime > RedTime): it's a little overtime, to list where can be enhanced.
          else if (SpeechTime > YellowTime): it's just within time, to list where can be enhanced.
          else if (SpeechTime > GreenTime): it just meets minimum requirement, to list where can be enhanced.
          else if (SpeechTime <= GreenTime): it didn't meet the minimum requirement, to list where can be expanded.
      2). Any suggestion or evaluaton should contain example from his/her speech
      3). To Bold keywords using markdown in your answer.
      3). Each speaker's evaluation should be about ${setting?.words} words.
      `,
      setting: {
        words: 50,
      },
    },
  ],
};

export const PSEvaluatorGuidance = (input: string) => `
My input is:
${input},
Are you ready to play an Evaluator role with my guidance?
`;

export const PSEvaluatorRecord: Record<string, ToastmastersRolePrompt[]> = {
  [ToastmastersRoles.PreparedSpeechEvaluator]: [
    {
      role: ToastmastersRoles.PreparedSpeechEvaluator,
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.PreparedSpeechEvaluator}. 
      Evaluate my prepared speech.
      Your evaluation should:
      1). Include the relevance between the Speech and the Topic.
      2). Bold keywords using markdown when present your answer.
      3). About ${setting?.words} words or 2 minutes.
      `,
      setting: {
        words: 200,
      },
    },
  ],
  [ToastmastersRoles.Grammarian]: [
    {
      role: ToastmastersRoles.Grammarian,
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}. 
      Evaluate my speech.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). First give me an accurate number where is the grammar error, and then evaluate my speech.
      3). Bold keywords using markdown when present your answer.
      4). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.AhCounter]: [
    {
      role: ToastmastersRoles.AhCounter,
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      Evaluate my speech.
      Your evaluation should:
      1). First give me an accurate number by count the number of filler words and pauses used in my speech, 
      and then evaluate my speech
      2). Bold keywords using markdown when present your answer.
      3). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.RevisedSpeech]: [
    {
      role: ToastmastersRoles.RevisedSpeech,
      contentWithSetting: (setting?) =>
        `You are the an teacher of ${ToastmastersRoles.Toastmasters}.
      Help revise, polish and improve my speech.
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). About ${setting?.words} words.
      `,
      setting: {
        words: 500,
      },
    },
  ],
};

export const ISEvaluatorGuidance = (input: string) => `
My input is:
${input},
Are you ready to answer? If you understand, answer yes.
`;

export const ISEvaluatorRecord: Record<string, ToastmastersRolePrompt[]> = {
  [ToastmastersRoles.TableTopicsEvaluator]: [
    {
      role: ToastmastersRoles.TableTopicsEvaluator + "-Count",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      1). Show me the keywords used in my speech from my 1st ask input.
      2). Don't make things up, all the keywords must from my speech.
      3). Don't include any extra description and extra words. 
      `,
    },
    {
      role: ToastmastersRoles.TableTopicsEvaluator + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.TableTopicsEvaluator}. 
      Evaluate my speech from my 1st ask input.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Refer some of the keywords in your last answer.
      3). Bold keywords using markdown when present your answer.
      4). Provide addvice to me based on my speech.
      5). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.Grammarian]: [
    {
      role: ToastmastersRoles.Grammarian + "-Count",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      1). Give me a table which presenting the accurate number of grammar errors used in my speech from my 1st ask input,
      2). Only response the table, 
      3). Do not include any extra description and extra words. 
      `,
    },
    {
      role: ToastmastersRoles.Grammarian + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}. 
      Evaluate my speech and analysis your stats in your last table. 
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from my speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to me based on my speech.
      4). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.AhCounter]: [
    {
      role: ToastmastersRoles.AhCounter + "-Count",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      1). Give me a table which presenting the accurate number of filler words and pauses used in my speech from my 1st ask input,
      2). Only response the table,
      3). Do not include any extra description and extra words.
      `,
    },
    {
      role: ToastmastersRoles.AhCounter + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.AhCounter}.
      To analysis your stats in your last table.
      You should:
      1). Generate a summary with the Ah-Counter's tone according to the table
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to to based on my speech.
      4). About ${setting?.words} words.
      `,
      setting: {
        words: 100,
      },
    },
  ],
  [ToastmastersRoles.RevisedSpeech]: [
    {
      role: "Revised Speech",
      contentWithSetting: (setting?) =>
        `You are an teacher of ${ToastmastersRoles.Toastmasters}.
      Help revise, polish and improve my speech from my 1st ask input,
      You should:
      1). Don't say who you are, just provide your revised speech.
      2). Bold keywords using markdown when present your answer.
      3). About ${setting?.words} words.
      `,
      setting: {
        words: 200,
      },
    },
  ],
  [ToastmastersRoles.DemoSpeech]: [
    {
      role: ToastmastersRoles.DemoSpeech,
      contentWithSetting: (setting?) =>
        `You are an teacher of ${ToastmastersRoles.Toastmasters}. 
      Give me a demo impromptu speech according to the Question from my 1st ask input,
      You should:
      1). Bold keywords using markdown when present your answer.
      2). No need to refer my speech.
      3). About ${setting?.words} words.
      `,
      setting: {
        words: 200,
      },
    },
  ],
};
