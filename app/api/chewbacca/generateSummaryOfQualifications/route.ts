import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/auth-options";
import { CustomSession } from "../../auth/[...nextauth]/typing";
import { requestOpenai } from "@/app/function/CallGptWithoutReactContext";
import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionRequestMessage } from "openai";

type RequirementResponse = {
  requirement: string;
  response: string;
  experience: string;
};

type RequirementCompetency = {
  requirement: string;
  competencies: string[];
};

type ProjectExperienceResponse = {
  projects: ProjectExperience[];
  monthsOfExperience: number;
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
  const { employeeAlias, requirements } = await req.json();

  const session = (await getServerSession(authOptions)) as CustomSession;
  if (
    !session.refresh_token_expiry ||
    Date.now() > session.refresh_token_expiry
  ) {
    return new Response(null, { status: 401 });
  }
  const token = session.access_token;

  const result =
    (await generateSummaryOfQualifications(
      requirements,
      employeeAlias as string,
      token,
    )) ?? "";

  return new Response(JSON.stringify(result), { status: 200 });
};

async function generateSummaryOfQualifications(
  requirementText: string[],
  employeeAlias: string,
  token: string,
): Promise<string | undefined> {
  const requirements = await findRelevantRequirements(
    requirementText,
    token,
    employeeAlias,
  );
  if (!requirements) {
    return undefined;
  }
  console.log(requirements);

  const requirementResponsesPromises = requirements
    .filter((req) => req.competencies.length > 0)
    .map(
      async (requirement) =>
        await generateRequirementResponse(requirement, token, employeeAlias),
    );
  const requirementResponses = await Promise.all(requirementResponsesPromises);

  console.log(requirementResponses);
  return await generateSummaryFromRequirementResponses(requirementResponses);
}

async function findRelevantRequirements(
  requirementText: string[],
  token: string,
  employeeAlias: string,
): Promise<RequirementCompetency[] | undefined> {
  const competencyOfEmployee: string[] | undefined =
    await requestEmployeeCompetencies(employeeAlias, token);

  if (!competencyOfEmployee) {
    return undefined;
  }

  return await Promise.all(
    requirementText.map(
      async (r) =>
        await generateKeywordsFromRequirements(r, competencyOfEmployee),
    ),
  );
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
    ? yearsOfExperience + "års erfaring"
    : monthsOfExperience + "måneders erfaring";
  if (relevantProjects.length < 1) {
    return {
      requirement: requirement.requirement,
      response: "",
      experience: "ingen erfaring",
    };
  }
  const prompt: string = `bruk tabellen under og svar på kravet. 
  Prosjekt med prosjektnavn og kundenavn når du referer til prosjekt. 
  Bruk sitater som er relevant for kravet i teksten.
    krav : ${
      requirement.requirement
    } tabell med utvalgte prosjekt: prosjektnavn,kundenavn,beskrivelse,rolle\n   ${relevantProjects
      ?.map(projectExperienceToText)
      .join("\n")}`;
  const response = await requestOpenai([{ role: "user", content: prompt }]);
  return {
    requirement: requirement.requirement,
    response: response,
    experience: experience,
  };
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
  const response = await requestOpenai([...example, prompt]);
  console.log(response);
  return {
    requirement: requirementText,
    competencies: JSON.parse(response) ?? [],
  };
}

async function generateSummaryFromRequirementResponses(
  requirementResponses: RequirementResponse[],
): Promise<string> {
  const prompt: string = `Her er krav-begrunnelse tabellen. Lag et sammendrag av konsulentens 
  erfaring som svarer på kravene.
  Sammendraget bør være langt. 
  Husk å referer til prosjektene og kunde i sammendraget.
  Husk å inkludere alle rader ifra tabellen i svaret.
  Det kan hende at samme prosjekt er brukt i de ulike begrunnelsene.
  Ikke bruk noe som ikke er med i tabellen. 
  Få med hvor mange års erfaring konsulenten har. ${requirementResponsesToTable(
    requirementResponses,
  )}`;
  const summary = await requestOpenai([{ role: "user", content: prompt }]);
  return (
    summary ??
    "Feil: krav-begrunnelse tabllen ble for lang og GPT gikk over token limit"
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

function projectExperienceToText(projectExperience: ProjectExperience): string {
  let roleText = projectExperience.roles
    .map((role) => role.title + ":" + role.description)
    .join(",");
  return `${projectExperience.title},${projectExperience.customer},${projectExperience.description},${roleText}`;
}

function requirementResponsesToTable(
  requirementResponses: RequirementResponse[],
): string {
  const header = "Requirement,Response\n";
  const rows = requirementResponses
    .map((rr) => `${rr.requirement},${rr.response},${rr.experience}`)
    .join("\n");
  const csv = header + rows + "\n";
  return csv;
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
