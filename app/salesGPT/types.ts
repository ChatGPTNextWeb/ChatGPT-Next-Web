export type EmployeeItem = {
  email: string;
  name: string;
  telephone: string;
  imageUrl: string;
  officeName: string;
  startDate: Date;
};

export type EmployeeItemProp = {
  employees: EmployeeItem[];
};

type WorkExperience = {
  id: string;
  title: string;
  description: string;
  monthFrom: string;
  yearFrom: string;
  monthTo: string;
  yearTo: string;
};

type Role = {
  id: string;
  title: string;
  description: string;
};

type ProjectExperience = {
  id: string;
  title: string;
  description: string;
  monthFrom: string;
  yearFrom: string;
  monthTo: string;
  yearTo: string;
  roles: Role[];
  competencies: string[];
};

type Presentation = {
  id: string;
  title: string;
  description: string;
  month: string;
  year: string;
};

type Certification = {
  id: string;
  title: string;
  description: string;
  expiryDate: Date;
  issuedMonth: string;
  issuedYear: string;
};

export type EmployeeCVDetails = {
  email: string;
  workExperiences: WorkExperience[];
  projectExperiences: ProjectExperience[];
  presentations: Presentation[];
  certifications: Certification[];
};

export type EmployeeOption = {
  value: EmployeeItem | undefined;
  label: string;
};

export enum HelpOptionValue {
  Summary = "summary",
  RequirementList = "requirementlist",
}

export type HelpOption = {
  label: string;
  value: HelpOptionValue | undefined;
};

export type InputListValue = {
  index: number;
  value: string;
};
