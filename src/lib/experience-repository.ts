import type { Experience } from "@/types";
import demoExperience from "../../content/experiences/demo.json";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/storage";

export type ExperienceVersion = {
  version: number;
  savedAt: string;
  label: string;
  snapshot: Experience;
};

const seed = demoExperience as Experience;

function draftKey(id: string) {
  return `${STORAGE_KEYS.experienceDraft}:${id}`;
}

function publishedKey(id: string) {
  return `${STORAGE_KEYS.experiencePublished}:${id}`;
}

function versionsKey(id: string) {
  return `${STORAGE_KEYS.experienceDraft}:versions:${id}`;
}

export function getSeedExperience(id = "exp-demo-001"): Experience {
  if (seed.id !== id && id !== "exp-demo-001") {
    throw new Error(`Unknown experience seed: ${id}`);
  }
  return structuredClone(seed);
}

export function loadPublishedExperience(id = "exp-demo-001"): Experience | null {
  return readJson<Experience | null>(publishedKey(id), null);
}

export function loadDraftExperience(id = "exp-demo-001"): Experience | null {
  return readJson<Experience | null>(draftKey(id), null);
}

/** Player runtime: published → seed. */
export function resolvePlayExperience(id = "exp-demo-001"): Experience {
  const published = loadPublishedExperience(id);
  if (published) return structuredClone(published);
  return getSeedExperience(id);
}

/** Preview / editor: draft → published → seed. */
export function resolveEditableExperience(id = "exp-demo-001"): Experience {
  const draft = loadDraftExperience(id);
  if (draft) return structuredClone(draft);
  const published = loadPublishedExperience(id);
  if (published) {
    return structuredClone({ ...published, status: "draft" });
  }
  return { ...getSeedExperience(id), status: "draft" };
}

export function saveDraftExperience(experience: Experience): void {
  const next = {
    ...experience,
    status: "draft" as const,
  };
  writeJson(draftKey(experience.id), next);
}

export function publishExperience(experience: Experience): Experience {
  const published: Experience = {
    ...structuredClone(experience),
    status: "published",
    version: (experience.version ?? 1) + 1,
  };
  writeJson(publishedKey(experience.id), published);
  writeJson(draftKey(experience.id), { ...published, status: "draft" });

  const versions = listVersions(experience.id);
  const entry: ExperienceVersion = {
    version: published.version ?? 1,
    savedAt: new Date().toISOString(),
    label: `Version ${published.version}`,
    snapshot: structuredClone(published),
  };
  writeJson(versionsKey(experience.id), [entry, ...versions].slice(0, 20));
  return published;
}

export function listVersions(id = "exp-demo-001"): ExperienceVersion[] {
  return readJson<ExperienceVersion[]>(versionsKey(id), []);
}

export function restoreVersion(id: string, version: number): Experience | null {
  const entry = listVersions(id).find((v) => v.version === version);
  if (!entry) return null;
  const restored = {
    ...structuredClone(entry.snapshot),
    status: "draft" as const,
  };
  saveDraftExperience(restored);
  return restored;
}

export function resetToSeed(id = "exp-demo-001"): Experience {
  const experience = { ...getSeedExperience(id), status: "draft" as const };
  saveDraftExperience(experience);
  return experience;
}
