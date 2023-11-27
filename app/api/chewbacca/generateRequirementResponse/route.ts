import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/auth-options";
import { CustomSession } from "../../auth/[...nextauth]/typing";
import { ChatCompletionRequestMessage } from "openai";
import { requestOpenai } from "@/app/function/CallGptWithoutReactContext";
import { projectExperienceToText } from "@/app/function/ProjectExperienceToText";

export type RequirementResponse = {
  requirement: string;
  response: string;
  experience: string;
  projects: ProjectExperience[];
};

type RequirementCompetency = {
  requirement: string;
  competencies: string[];
};

type ProjectExperienceResponse = {
  projects: ProjectExperience[];
  monthsOfExperience: number;
};
export type ProjectExperience = {
  id: string;
  title: string;
  description: string;
  monthFrom: string;
  yearFrom: string;
  monthTo: string;
  yearTo: string;
  roles: Role[];
  competencies: string[];
  customer: string;
};

type Role = {
  id: string;
  title: string;
  description: string;
};

const BASE_URL = process.env.CHEWBACCA_BASE_URL;

export const POST = async (
  req: NextRequest,
  res: NextResponse,
): Promise<Response> => {
  const { employeeAlias, requirement } = await req.json();

  const session = (await getServerSession(authOptions)) as CustomSession;
  if (
    !session.refresh_token_expiry ||
    Date.now() > session.refresh_token_expiry
  ) {
    return new Response(null, { status: 401 });
  }
  const token = session.access_token;
  const rc = await findRelevantRequirements(requirement, token, employeeAlias);

  if (!rc || rc.competencies.length < 1) {
    return new Response(JSON.stringify({}), { status: 400 });
  }

  const result = await generateRequirementResponse(rc, token, employeeAlias);

  return new Response(JSON.stringify(result), { status: 200 });
};

async function findRelevantRequirements(
  requirementText: string,
  token: string,
  employeeAlias: string,
): Promise<RequirementCompetency | undefined> {
  const competencyOfEmployee: string[] | undefined =
    await requestEmployeeCompetencies(employeeAlias, token);

  if (!competencyOfEmployee) {
    return undefined;
  }

  return await generateKeywordsFromRequirements(
    requirementText,
    competencyOfEmployee,
  );
}

async function requestEmployeeCompetencies(
  employeeAlias: string,
  token: string,
) {
  const request = await fetch(
    `${BASE_URL}/employees/competencies?alias=${employeeAlias}&country=no`,
    {
      headers: {
        Authorization: `bearer ${token}`,
      },
    },
  );
  if (!request.ok) {
    return Promise.resolve(undefined);
  }
  return (await request.json()) as string[];
}

async function generateKeywordsFromRequirements(
  requirementText: string,
  competencies: string[],
): Promise<RequirementCompetency> {
  const example: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content:
        'Jeg har en nøkkelordliste : [JIRA,KUBERNETES,AZURE,GCP,AWS,JAVA,C#] svar hvilke nøkkelord som er relevant for kravet : "Kandidaten må være god på utvikling av skytjenester ". Svaret skal være en JSON liste som er et utvalg fra den nye nøkkelordlisten. Bare nøkkelord fra nøkkelordlisten kan bli med i svaret.',
    },
    { role: "assistant", content: '["KUBERNETES","GCP","AZURE","AWS"]' },
    {
      role: "user",
      content:
        'Glem tidligere nøkkelordliste. Her er den nye nøkkelordlisten [BÆREKRAFTIG DESIGN, BRUKERTESTING, INNSIKTSARBEID] svar hvilke nøkkelord som er relevant for kravet : "kandidaten må ha lang erfaring med Java". Svaret skal være en JSON liste som er et utvalg fra den nye nøkkelordlisten. Bare nøkkelord fra nøkkelordlisten kan bli med i svaret.',
    },
    {
      role: "assistant",
      content: "[]",
    },
  ];
  const prompt: ChatCompletionRequestMessage = {
    role: "user",
    content: ` Glem tidligere nøkkelord. Jeg har en ny nøkkelordliste: [${competencies}] svar hvilke nøkkelord som er relevant for kravet : "${requirementText}". Svaret skal være en JSON liste som er et utvalg fra den nye nøkkelordlisten. Bare nøkkelord fra nøkkelordlisten kan bli med i svaret.`,
  };
  const response = await requestOpenai(
    [...example, prompt],
    "variant-rocks",
    800,
    0.6,
  );
  console.log(response);
  return {
    requirement: requirementText,
    competencies: JSON.parse(response) ?? [],
  };
}

async function generateRequirementResponse(
  requirement: RequirementCompetency,
  token: string,
  employeeAlias: string,
): Promise<RequirementResponse> {
  const projectExperienceResponse = await findRelevantProjectForCompetencies(
    token,
    employeeAlias,
    requirement.competencies,
  );
  const relevantProjects = projectExperienceResponse?.projects ?? [];
  const monthsOfExperience = projectExperienceResponse?.monthsOfExperience ?? 0;
  const yearsOfExperience = monthsExperienceToYears(monthsOfExperience);
  const experience = yearsOfExperience
    ? yearsOfExperience + " års erfaring"
    : monthsOfExperience + " måneders erfaring";
  if (relevantProjects.length < 1) {
    return {
      requirement: requirement.requirement,
      response: "",
      experience: "ingen erfaring",
      projects: [],
    };
  }
  const prompt: string = `bruk tabellen under og svar på kravet. 
    Prosjekt med prosjektnavn og kundenavn når du referer til prosjekt. 
    Bruk sitater som er relevant for kravet i teksten.
    Du kan ikke forvente at leser kjenner til tabellen.
    Du skal lage en sammenhengende tekst og ikke en tabell. 
    Argumenter best mulig hvordan prosjektene svarer mot kravet.
    Ikke ta med informasjon som ikke er relevant for kravet.
      krav : ${
        requirement.requirement
      } tabell med utvalgte prosjekt: prosjektnavn,kundenavn,beskrivelse,rolle\n   ${relevantProjects
        ?.map(projectExperienceToText)
        .join("\n")}`;
  console.log(prompt);
  const response = await requestOpenai(
    [{ role: "user", content: prompt }],
    "variant-rocks-turbo-16k",
    2000,
    0.75,
  );
  return {
    requirement: requirement.requirement,
    response: response,
    experience: experience,
    projects: relevantProjects,
  };
}

async function findRelevantProjectForCompetencies(
  token: string,
  employeeAlias: string,
  competencies: string[],
): Promise<ProjectExperienceResponse | undefined> {
  const request = await fetch(
    `${BASE_URL}/employees/cv/projectExperiences?alias=${employeeAlias}&country=no&competencies=${competencies.join(
      "&competencies",
    )}`,
    {
      headers: {
        Authorization: `bearer ${token}`,
      },
    },
  );

  if (!request.ok) {
    return Promise.resolve(undefined);
  }
  return (await request.json()) as ProjectExperienceResponse;
}

function monthsExperienceToYears(months: number): number | null {
  const years = Math.floor(months / 12);
  const remainderMonths = months % 12;
  if (remainderMonths > 8) {
    return years + 1;
  }
  if (remainderMonths > 4) {
    return years + 0.5;
  }
  if (years === 0) {
    return null;
  }
  return years;
}
