import type { Experience } from "@/types";
import demoExperience from "../../content/experiences/demo.json";

const catalog: Record<string, Experience> = {
  "exp-demo-001": demoExperience as Experience,
};

export function loadExperience(id = "exp-demo-001"): Experience {
  const experience = catalog[id];
  if (!experience) {
    throw new Error(`Experience not found: ${id}`);
  }
  return structuredClone(experience);
}

export function listExperienceIds(): string[] {
  return Object.keys(catalog);
}
