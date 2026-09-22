import type { Experience } from "@/types";
import demoExperience from "../../content/experiences/demo.json";
import monicaExperience from "../../content/experiences/monica.json";
import { readJson, writeJson, removeKey, STORAGE_KEYS } from "@/lib/storage";

export type ExperienceVersion = {
  version: number;
  savedAt: string;
  label: string;
  snapshot: Experience;
};

/** Canonical public journey for Mónica — never replace with empty demo seed. */
export const MONICA_EXPERIENCE_ID = "exp-monica-001";
export const DEMO_EXPERIENCE_ID = "exp-demo-001";

const seeds: Record<string, Experience> = {
  [DEMO_EXPERIENCE_ID]: demoExperience as Experience,
  [MONICA_EXPERIENCE_ID]: monicaExperience as Experience,
};

function draftKey(id: string) {
  return `${STORAGE_KEYS.experienceDraft}:${id}`;
}

function publishedKey(id: string) {
  return `${STORAGE_KEYS.experiencePublished}:${id}`;
}

function versionsKey(id: string) {
  return `${STORAGE_KEYS.experienceDraft}:versions:${id}`;
}

function notifyExperienceUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("rj:experience-updated"));
}

export function getSeedExperience(id = MONICA_EXPERIENCE_ID): Experience {
  const seed = seeds[id] ?? seeds[MONICA_EXPERIENCE_ID];
  if (!seed) {
    throw new Error(`Unknown experience seed: ${id}`);
  }
  return structuredClone(seed);
}

export function loadPublishedExperience(
  id = MONICA_EXPERIENCE_ID,
): Experience | null {
  return readJson<Experience | null>(publishedKey(id), null);
}

export function loadDraftExperience(
  id = MONICA_EXPERIENCE_ID,
): Experience | null {
  return readJson<Experience | null>(draftKey(id), null);
}

/** Player runtime: published → monica.json (or demo for legacy id). */
export function resolvePlayExperience(
  id = MONICA_EXPERIENCE_ID,
): Experience {
  const published = loadPublishedExperience(id);
  if (published) return structuredClone(published);
  return getSeedExperience(id);
}

/** Preview / editor: draft → published → seed. */
export function resolveEditableExperience(
  id = MONICA_EXPERIENCE_ID,
): Experience {
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

/** Keep /monica in sync without bumping the version number. */
export function mirrorPublishedExperience(experience: Experience): void {
  const published: Experience = {
    ...structuredClone(experience),
    status: "published",
  };
  writeJson(publishedKey(experience.id), published);
  writeJson(draftKey(experience.id), { ...published, status: "draft" });
  notifyExperienceUpdated();
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
  writeJson(versionsKey(experience.id), [entry, ...versions].slice(0, 50));
  notifyExperienceUpdated();
  return published;
}

export function listVersions(id = MONICA_EXPERIENCE_ID): ExperienceVersion[] {
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

export function restoreVersionAt(
  id: string,
  savedAt: string,
): Experience | null {
  const entry = listVersions(id).find((v) => v.savedAt === savedAt);
  if (!entry) return null;
  const restored = {
    ...structuredClone(entry.snapshot),
    status: "draft" as const,
  };
  saveDraftExperience(restored);
  return restored;
}

/**
 * Reset draft to the on-disk seed for that id (monica.json or demo.json).
 * Does NOT clear Monica's published copy unless id is demo.
 */
export function resetToSeed(id = MONICA_EXPERIENCE_ID): Experience {
  const experience = { ...getSeedExperience(id), status: "draft" as const };
  saveDraftExperience(experience);
  if (id !== MONICA_EXPERIENCE_ID) {
    removeKey(publishedKey(id));
  }
  notifyExperienceUpdated();
  return experience;
}

/**
 * Force on-disk monica/demo file into draft + published.
 * Always snapshots previous browser content first.
 */
export function applySeedToPlayer(id = MONICA_EXPERIENCE_ID): Experience {
  const previous =
    loadDraftExperience(id) ?? loadPublishedExperience(id) ?? null;

  if (previous) {
    const versions = listVersions(id);
    const backup: ExperienceVersion = {
      version: previous.version ?? 1,
      savedAt: new Date().toISOString(),
      label: `Antes de recargar archivo (v${previous.version ?? 1})`,
      snapshot: structuredClone(previous),
    };
    writeJson(versionsKey(id), [backup, ...versions].slice(0, 50));
  }

  return publishExperience(getSeedExperience(id));
}
