import {
  ToastmastersRolePrompt,
  ToastmastersRoles,
} from "../toastmasters/roles";

export enum InterviewRoles {
  SelfServeInterview = "Self Interview",
  FreeInterview = "Free Interview",
}

export enum InterviewJobTitles {
  SoftwareDeveloper = "Software Developer",
  ProductManager = "Product Manager",
  HumanResourcesSpecialist = "Human Resources Specialist",
  CostomJob = "Costom Job",
}

export enum InterviewActions {
  NextQuestion = "NextQuestion",
  EvaluateCurrent = "EvaluateCurrent",
  EndInterview = "EndInterview",
}

export const InterviewJobDescriptions: Record<string, string> = {
  [InterviewJobTitles.SoftwareDeveloper]: `Job Title: Software Engineer

    Role Summary: We are looking for a Software Engineer to join our diverse and dedicated team. This position is an excellent opportunity for those seeking to grow their skills and experience in software development while working on projects with significant impact.
    
    Responsibilities:
    - Develop and implement new software solutions.
    - Collaborate with teams to understand objectives, design features, and meet specific requirements.
    - Improve and maintain existing software to ensure strong functionality and optimization.
    - Recommend changes to existing software applications, as necessary, to ensure excellent functionality.
    - Write efficient, secure, well-documented, and clean JavaScript code.
    - Participate in all phases of the development life cycle.
    
    Requirements:
    - Degree in Computer Science or related field.
    - 0-3 years of experience in software development.
    - Demonstrated problem-solving abilities and attention to detail.
    - Proficiency with at least one programming language.
    - Familiarity with various operating systems and platforms.
    - Good understanding of software development principles.
    - Excellent communication and teamwork skills.
    - Demonstrated ability to manage and prioritize tasks independently.
    `,
  [InterviewJobTitles.ProductManager]: `Job Title: Product Manager

    Role Summary: We are seeking an enthusiastic Product Manager to join our team. This is an excellent opportunity for individuals at the early stage of their career to contribute to the full product life cycle and work on products that reach users worldwide.

    Responsibilities:
    - Manage the entire product line life cycle from strategic planning to tactical activities.
    - Work closely with multiple teams to define product requirements.
    - Develop product roadmaps to meet business targets.
    - Analyze market trends and competition.
    - Conduct usability studies and perform user research to understand user needs.
    - Prioritize features and tasks for product development based on business and customer impact.
    - Work with the sales and marketing teams to define the go-to-market strategy.

    Requirements:
    - Bachelor's degree in Business, Engineering, Computer Science, or related field.
    - 0-3 years of experience in product management or a related field.
    - Strong problem-solving skills and willingness to roll up one's sleeves to get the job.
    - Excellent written and verbal communication skills.
    - Skilled at working effectively with cross-functional teams in a matrix organization.
    - Proficiency in web analytics tools and experience in data-driven decision making.
    `,
  [InterviewJobTitles.HumanResourcesSpecialist]: `Job Title: Human Resources Specialist

    Role Summary: We are seeking a detail-oriented Human Resources Specialist to join our team. This position offers the opportunity to be involved in a broad range of HR functions, providing excellent experience in the field.
    
    Responsibilities:
    - Assist with all internal and external HR-related matters.
    - Participate in developing organizational guidelines and procedures.
    - Recommend strategies to motivate employees.
    - Assist with the recruitment process by identifying candidates, conducting reference checks, and issuing employment contracts.
    - Investigate complaints brought forward by employees.
    - Coordinate employee development plans and performance management.
    - Perform orientations and update records of new staff.
    
    Requirements:
    - Bachelor's degree in Human Resources or related field.
    - 0-3 years of experience in a Human Resources position or related field.
    - Strong interpersonal and communication skills.
    - Ability to manage a wide range of relationships with a variety of stakeholders.
    - Proficient in Microsoft Office applications, especially Excel, or similar software.
    - Working knowledge of employment laws and regulations.
    - Excellent administrative and organizational skills.
    `,
  [InterviewJobTitles.CostomJob]: `Job Title: 
    `,
};

export const InterviewSelfServeGuidance = (jobDescription: string) => `
This is Job Description:
{
${jobDescription}
}

${InterviewActions.NextQuestion}
`;

export const InterviewSelfServeFinalGuidance = (input: string) => `
The Question-Speech pairs are:
${input},
Are you ready to answer? If you understand, answer yes.
`;

export const InterviewSelfServeRecord: Record<
  string,
  ToastmastersRolePrompt[]
> = {
  ["General Evaluator"]: [
    {
      role: "General Evaluator",
      contentWithSetting: (setting?) =>
        `EndInterview. Now give me a general evaluation about all my answers. You evaluation should be: 200 words.
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
      1). Give me a table which presenting the accurate number of grammar errors used in my each answer.
      2). Only response the table, the rows in your table should be equal to the number of questions you give me.
      3). Do not include any extra description and extra words.
      `,
    },
    {
      role: ToastmastersRoles.Grammarian + "-Evaluation",
      contentWithSetting: (setting?) =>
        `You are the ${ToastmastersRoles.Grammarian}.
      Evaluate all my answers and analysis the stats in your table.
      Your evaluation should:
      1). Don't make things up, all your quoted sentence must from the my speech.
      2). Bold keywords using markdown when present your answer.
      3). Provide addvice to the my speech.
      `,
      setting: {
        words: 50,
      },
    },
  ],
};
