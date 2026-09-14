import type { Experience } from "@/types";
import { resolvePlayExperience, loadDraftExperience, getSeedExperience } from "@/lib/experience-repository";

export function loadExperience(
  id = "exp-demo-001",
  options?: { preview?: boolean },
): Experience {
  if (options?.preview) {
    const draft = loadDraftExperience(id);
    if (draft) return structuredClone(draft);
    return getSeedExperience(id);
  }
  return resolvePlayExperience(id);
}

export function listExperienceIds(): string[] {
  return ["exp-demo-001"];
}
