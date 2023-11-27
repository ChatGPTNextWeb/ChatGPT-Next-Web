import { ProjectExperience } from "../api/chewbacca/generateRequirementResponse/route";

export function projectExperienceToText(
  projectExperience: ProjectExperience,
): string {
  let roleText = projectExperience.roles
    .map((role) => role.title + ":" + role.description)
    .join(",");
  return `${projectExperience.title},${projectExperience.customer},${projectExperience.description},${roleText}`;
}
