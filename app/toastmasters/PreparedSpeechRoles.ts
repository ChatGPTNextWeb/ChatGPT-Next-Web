import { ILightsTime, InputStore } from "../store";
import { ToastmastersRoleSetting, ToastmastersRoles } from "./roles";

interface IToastmastersRoleSetting {
  Checked: boolean;
  Evaluation: string;
  Setting: ToastmastersRoleSetting;
}

interface IToastmastersRolePrompt {
  role: string;
  content: string;
}

export class PreparedSpeechInput {
  Topic: InputStore = new InputStore();
  Speech: InputStore = new InputStore();

  RolesSetting: Record<string, IToastmastersRoleSetting> = {
    [ToastmastersRoles.PreparedSpeechEvaluator]: {
      Checked: true,
      Evaluation: "",
      Setting: {
        words: 200,
      },
    },
    [ToastmastersRoles.Grammarian]: {
      Checked: true,
      Evaluation: "",
      Setting: {
        words: 100,
      },
    },
    [ToastmastersRoles.AhCounter]: {
      Checked: true,
      Evaluation: "",
      Setting: {
        words: 100,
      },
    },
    [ToastmastersRoles.RevisedSpeech]: {
      Checked: true,
      Evaluation: "",
      Setting: {
        words: 200,
      },
    },
  };

  static ResetEvaluation(
    rolesSetting: Record<string, IToastmastersRoleSetting>,
  ): void {
    for (const key in rolesSetting) {
      rolesSetting[key].Evaluation = "";
    }
  }

  static GetCheckedRoles(
    rolesSetting: Record<string, IToastmastersRoleSetting>,
  ): Record<string, IToastmastersRoleSetting> {
    const checkedRoles: Record<string, IToastmastersRoleSetting> = {};
    for (const key in rolesSetting) {
      if (rolesSetting[key].Checked) {
        checkedRoles[key] = rolesSetting[key];
      }
    }
    return checkedRoles;
  }

  static GetEvaluateGuidance(input: string): string {
    return `
      My input is:
      ${input},
      Are you ready to play an Evaluator role with my guidance?
      `;
  }

  static GetEvaluateRolesPrompt(
    role: string,
    setting: ToastmastersRoleSetting,
  ): string {
    if (role === ToastmastersRoles.PreparedSpeechEvaluator)
      return `You are the ${ToastmastersRoles.PreparedSpeechEvaluator}. 
          Evaluate my prepared speech.
          Your evaluation should:
          1). Include the relevance between the Speech and the Topic.
          2). Bold keywords using markdown when present your answer.
          3). About ${setting?.words} words or 2 minutes.
          `;
    else if (role === ToastmastersRoles.Grammarian)
      return `You are the ${ToastmastersRoles.Grammarian}. 
        Evaluate my speech.
        Your evaluation should:
        1). Don't make things up, all your quoted sentence must from my speech.
        2). First give me an accurate number where is the grammar error, and then evaluate my speech.
        3). Bold keywords using markdown when present your answer.
        4). About ${setting?.words} words.
        `;
    else if (role === ToastmastersRoles.AhCounter)
      return `You are the ${ToastmastersRoles.AhCounter}.
        Evaluate my speech.
        Your evaluation should:
        1). First give me an accurate number by count the number of filler words and pauses used in my speech, 
        and then evaluate my speech
        2). Bold keywords using markdown when present your answer.
        3). About ${setting?.words} words.
        `;
    else if (role === ToastmastersRoles.RevisedSpeech)
      return `You are the an teacher of ${ToastmastersRoles.Toastmasters}.
        Help revise, polish and improve my speech.
        You should:
        1). Don't say who you are, just provide your revised speech.
        2). Bold keywords using markdown when present your answer.
        3). About ${setting?.words} words.
        `;

    return "";
  }

  static GetEvaluateRolesPrompts(
    role: string,
    setting: ToastmastersRoleSetting,
  ): IToastmastersRolePrompt[] {
    if (role === ToastmastersRoles.PreparedSpeechEvaluator)
      return [
        {
          role: ToastmastersRoles.PreparedSpeechEvaluator,
          content: `You are the ${ToastmastersRoles.PreparedSpeechEvaluator}. 
          Evaluate my prepared speech.
          Your evaluation should:
          1). Include the relevance between the Speech and the Topic.
          2). Bold keywords using markdown when present your answer.
          3). About ${setting?.words} words or 2 minutes.
          `,
        },
      ];
    else if (role === ToastmastersRoles.Grammarian)
      return [
        {
          role: ToastmastersRoles.Grammarian,
          content: `You are the ${ToastmastersRoles.Grammarian}. 
        Evaluate my speech.
        Your evaluation should:
        1). Don't make things up, all your quoted sentence must from my speech.
        2). First give me an accurate number where is the grammar error, and then evaluate my speech.
        3). Bold keywords using markdown when present your answer.
        4). About ${setting?.words} words.
        `,
        },
      ];
    else if (role === ToastmastersRoles.AhCounter)
      return [
        {
          role: ToastmastersRoles.AhCounter,
          content: `You are the ${ToastmastersRoles.AhCounter}.
        Evaluate my speech.
        Your evaluation should:
        1). First give me an accurate number by count the number of filler words and pauses used in my speech, 
        and then evaluate my speech
        2). Bold keywords using markdown when present your answer.
        3). About ${setting?.words} words.
        `,
        },
      ];
    else if (role === ToastmastersRoles.RevisedSpeech)
      return [
        {
          role: ToastmastersRoles.RevisedSpeech,
          content: `You are the an teacher of ${ToastmastersRoles.Toastmasters}.
        Help revise, polish and improve my speech.
        You should:
        1). Don't say who you are, just provide your revised speech.
        2). Bold keywords using markdown when present your answer.
        3). About ${setting?.words} words.
        `,
        },
      ];

    return [];
  }
}
