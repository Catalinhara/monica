import type { Experience } from "@/types";
import {
  resolvePlayExperience,
  loadDraftExperience,
  getSeedExperience,
  MONICA_EXPERIENCE_ID,
  DEMO_EXPERIENCE_ID,
} from "@/lib/experience-repository";

export function loadExperience(
  id = MONICA_EXPERIENCE_ID,
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
  return [MONICA_EXPERIENCE_ID, DEMO_EXPERIENCE_ID];
}
