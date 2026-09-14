"use client";

import { create } from "zustand";
import type { Experience, Level, LevelType, Scene } from "@/types";
import {
  listVersions,
  publishExperience,
  resetToSeed,
  resolveEditableExperience,
  restoreVersion,
  saveDraftExperience,
  type ExperienceVersion,
} from "@/lib/experience-repository";
import { THEMES, type ThemeId } from "@/lib/themes";

export type AdminPanel =
  | "experience"
  | "level"
  | "final"
  | "assets"
  | "versions";

type AdminState = {
  draft: Experience | null;
  selectedLevelId: string | null;
  panel: AdminPanel;
  versions: ExperienceVersion[];
  dirty: boolean;
  lastSavedAt: string | null;
  message: string | null;
  hydrate: () => void;
  setPanel: (panel: AdminPanel) => void;
  selectLevel: (levelId: string | null) => void;
  updateMeta: (patch: Partial<Pick<Experience, "title" | "recipientName">>) => void;
  setTheme: (themeId: ThemeId) => void;
  updateFinalQuestion: (patch: Partial<Experience["finalQuestion"]>) => void;
  updateNoBehavior: (
    patch: Partial<Experience["finalQuestion"]["noBehavior"]>,
  ) => void;
  updateCelebration: (patch: Partial<Experience["celebration"]>) => void;
  updateFinalReward: (patch: Partial<NonNullable<Experience["finalReward"]>>) => void;
  updateLevel: (levelId: string, patch: Partial<Level>) => void;
  addLevel: (type?: LevelType) => void;
  duplicateLevel: (levelId: string) => void;
  deleteLevel: (levelId: string) => void;
  moveLevel: (levelId: string, direction: -1 | 1) => void;
  setScenesJson: (levelId: string, json: string) => { ok: boolean; error?: string };
  saveDraft: () => void;
  publish: () => void;
  restore: (version: number) => void;
  resetSeed: () => void;
};

function sortLevels(levels: Level[]): Level[] {
  return levels
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((level, index) => ({ ...level, order: index }));
}

function touch(draft: Experience): Experience {
  return { ...draft, status: "draft" };
}

export const useAdminStore = create<AdminState>((set, get) => ({
  draft: null,
  selectedLevelId: null,
  panel: "experience",
  versions: [],
  dirty: false,
  lastSavedAt: null,
  message: null,

  hydrate: () => {
    const draft = resolveEditableExperience();
    set({
      draft,
      selectedLevelId: draft.levels[0]?.id ?? null,
      versions: listVersions(draft.id),
      dirty: false,
      message: null,
    });
  },

  setPanel: (panel) => set({ panel }),

  selectLevel: (levelId) =>
    set({
      selectedLevelId: levelId,
      panel: levelId ? "level" : get().panel === "level" ? "experience" : get().panel,
    }),

  updateMeta: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({ draft: touch({ ...draft, ...patch }), dirty: true, message: null });
  },

  setTheme: (themeId) => {
    const { draft } = get();
    if (!draft) return;
    const theme = THEMES[themeId];
    set({
      draft: touch({
        ...draft,
        theme: {
          id: theme.id,
          name: theme.name,
          colors: {
            background: theme.colors.background,
            foreground: theme.colors.foreground,
            accent: theme.colors.accent,
            muted: theme.colors.muted,
          },
        },
      }),
      dirty: true,
    });
  },

  updateFinalQuestion: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: touch({
        ...draft,
        finalQuestion: { ...draft.finalQuestion, ...patch },
      }),
      dirty: true,
    });
  },

  updateNoBehavior: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: touch({
        ...draft,
        finalQuestion: {
          ...draft.finalQuestion,
          noBehavior: { ...draft.finalQuestion.noBehavior, ...patch },
        },
      }),
      dirty: true,
    });
  },

  updateCelebration: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: touch({
        ...draft,
        celebration: { ...draft.celebration, ...patch },
      }),
      dirty: true,
    });
  },

  updateFinalReward: (patch) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: touch({
        ...draft,
        finalReward: {
          title: draft.finalReward?.title ?? "",
          body: draft.finalReward?.body ?? "",
          cta: draft.finalReward?.cta,
          ...patch,
        },
      }),
      dirty: true,
    });
  },

  updateLevel: (levelId, patch) => {
    const { draft } = get();
    if (!draft) return;
    set({
      draft: touch({
        ...draft,
        levels: draft.levels.map((level) =>
          level.id === levelId ? { ...level, ...patch } : level,
        ),
      }),
      dirty: true,
    });
  },

  addLevel: (type = "story") => {
    const { draft } = get();
    if (!draft) return;
    const order = draft.levels.length;
    const id = `level-${Date.now()}`;
    const level: Level = {
      id,
      order,
      title: `Nuevo nivel ${order}`,
      type,
      active: true,
      content: [
        {
          id: `scene-${Date.now()}`,
          type: "text",
          content: { text: "Nueva escena" },
        },
      ],
      completion: { type: type === "story" ? "all-scenes" : "manual" },
    };
    set({
      draft: touch({ ...draft, levels: [...draft.levels, level] }),
      selectedLevelId: id,
      panel: "level",
      dirty: true,
    });
  },

  duplicateLevel: (levelId) => {
    const { draft } = get();
    if (!draft) return;
    const source = draft.levels.find((l) => l.id === levelId);
    if (!source) return;
    const id = `level-${Date.now()}`;
    const copy: Level = {
      ...structuredClone(source),
      id,
      title: `${source.title} (copia)`,
      order: draft.levels.length,
    };
    set({
      draft: touch({
        ...draft,
        levels: sortLevels([...draft.levels, copy]),
      }),
      selectedLevelId: id,
      dirty: true,
    });
  },

  deleteLevel: (levelId) => {
    const { draft, selectedLevelId } = get();
    if (!draft) return;
    const levels = sortLevels(draft.levels.filter((l) => l.id !== levelId));
    set({
      draft: touch({ ...draft, levels }),
      selectedLevelId:
        selectedLevelId === levelId ? (levels[0]?.id ?? null) : selectedLevelId,
      dirty: true,
    });
  },

  moveLevel: (levelId, direction) => {
    const { draft } = get();
    if (!draft) return;
    const levels = sortLevels(draft.levels);
    const index = levels.findIndex((l) => l.id === levelId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= levels.length) return;
    const next = [...levels];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    set({
      draft: touch({ ...draft, levels: sortLevels(next) }),
      dirty: true,
    });
  },

  setScenesJson: (levelId, json) => {
    try {
      const parsed = JSON.parse(json) as Scene[];
      if (!Array.isArray(parsed)) {
        return { ok: false, error: "El contenido debe ser un array de escenas." };
      }
      get().updateLevel(levelId, { content: parsed });
      return { ok: true };
    } catch {
      return { ok: false, error: "JSON inválido." };
    }
  },

  saveDraft: () => {
    const { draft } = get();
    if (!draft) return;
    saveDraftExperience(draft);
    set({
      dirty: false,
      lastSavedAt: new Date().toISOString(),
      message: "Borrador guardado",
    });
  },

  publish: () => {
    const { draft } = get();
    if (!draft) return;
    const published = publishExperience(draft);
    set({
      draft: { ...published, status: "draft" },
      versions: listVersions(published.id),
      dirty: false,
      lastSavedAt: new Date().toISOString(),
      message: `Publicado como v${published.version}`,
    });
  },

  restore: (version) => {
    const { draft } = get();
    if (!draft) return;
    const restored = restoreVersion(draft.id, version);
    if (!restored) return;
    set({
      draft: restored,
      versions: listVersions(draft.id),
      dirty: true,
      message: `Restaurada versión ${version} en borrador`,
      selectedLevelId: restored.levels[0]?.id ?? null,
    });
  },

  resetSeed: () => {
    const draft = resetToSeed();
    set({
      draft,
      versions: listVersions(draft.id),
      selectedLevelId: draft.levels[0]?.id ?? null,
      dirty: true,
      message: "Restaurado desde seed demo",
    });
  },
}));
