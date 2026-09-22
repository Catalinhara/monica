"use client";

import { create } from "zustand";
import type { Experience, Level, LevelType, Scene } from "@/types";
import {
  applySeedToPlayer,
  listVersions,
  mirrorPublishedExperience,
  MONICA_EXPERIENCE_ID,
  publishExperience,
  resetToSeed,
  resolveEditableExperience,
  restoreVersion,
  restoreVersionAt,
  saveDraftExperience,
  type ExperienceVersion,
} from "@/lib/experience-repository";
import {
  flushExperienceAutosave,
  persistExperienceToDisk,
  cancelExperienceAutosave,
} from "@/lib/persist-experience";
import { THEMES, type ThemeId } from "@/lib/themes";
import { createEmptyPuzzleScenes } from "@/components/admin/PuzzleSlotsEditor";

export type AdminPanel =
  | "experience"
  | "level"
  | "final"
  | "assets"
  | "versions";

export type DiskStatus = "idle" | "saving" | "saved" | "error";

type AdminState = {
  draft: Experience | null;
  selectedLevelId: string | null;
  panel: AdminPanel;
  versions: ExperienceVersion[];
  dirty: boolean;
  diskStatus: DiskStatus;
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
  flushPendingSave: () => Promise<void>;
  restore: (version: number) => void;
  restoreAt: (savedAt: string) => void;
  resetSeed: () => void;
  applySeed: () => void;
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

/**
 * Apply a draft mutation: update React state + localStorage draft only.
 * Disk writes happen on explicit "Guardar ahora" / "Publicar" (no autosave).
 */
function commitDraft(
  get: () => AdminState,
  set: (p: Partial<AdminState>) => void,
  next: Experience,
  options?: { message?: string },
) {
  const draft = touch(next);
  // Ensure Monica journey always keeps its stable id.
  if (!draft.id || draft.id === "exp-demo-001") {
    draft.id = MONICA_EXPERIENCE_ID;
  }
  set({
    draft,
    dirty: true,
    message: options?.message ?? "Cambios locales · pulsa Guardar ahora para disco",
  });
  saveDraftExperience(draft);
}

export const useAdminStore = create<AdminState>((set, get) => ({
  draft: null,
  selectedLevelId: null,
  panel: "experience",
  versions: [],
  dirty: false,
  diskStatus: "idle",
  lastSavedAt: null,
  message: null,

  hydrate: () => {
    cancelExperienceAutosave();
    void (async () => {
      let draft = resolveEditableExperience(MONICA_EXPERIENCE_ID);
      // Prefer on-disk monica.json when it has richer recovered content.
      try {
        const res = await fetch("/api/experience/monica", { cache: "no-store" });
        const payload = (await res.json()) as {
          ok?: boolean;
          experience?: Experience;
        };
        const disk = payload.experience;
        if (payload.ok && disk) {
          const diskIntro = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-0")?.content ?? [],
          ).toLowerCase();
          const localIntro = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-0")?.content ?? [],
          ).toLowerCase();
          const diskLab = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-4")?.content ?? [],
          );
          const localLab = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-4")?.content ?? [],
          );
          const diskQuiz = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-2")?.content ?? [],
          );
          const localQuiz = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-2")?.content ?? [],
          );
          const diskHasRecoveredIntro =
            diskIntro.includes("cuerpazo") || diskIntro.includes("gastrobar");
          const localHasRecoveredIntro =
            localIntro.includes("cuerpazo") || localIntro.includes("gastrobar");
          const diskHasPolishedLab =
            (diskLab.includes("Resistencia al agua fría") ||
              diskLab.includes("Risas por tonterías") ||
              diskLab.includes("Intimidad y sexo") ||
              diskLab.includes("Comunicación")) &&
            diskLab.includes("verdictLabel") &&
            diskLab.includes("introTitle");
          const localHasPolishedLab =
            (localLab.includes("Resistencia al agua fría") ||
              localLab.includes("Risas por tonterías") ||
              localLab.includes("Intimidad y sexo") ||
              localLab.includes("Comunicación")) &&
            localLab.includes("verdictLabel") &&
            localLab.includes("introTitle");
          const diskHasPersonalizedLab =
            diskLab.includes("Resistencia al agua fría") ||
            diskLab.includes("Risas por tonterías");
          const localHasPersonalizedLab =
            localLab.includes("Resistencia al agua fría") ||
            localLab.includes("Risas por tonterías");
          const diskHasRecoveredQuiz =
            diskQuiz.includes("no tengo sueño") ||
            (Array.isArray(disk.levels?.find((l) => l.id === "level-2")?.content) &&
              (disk.levels?.find((l) => l.id === "level-2")?.content.length ?? 0) >=
                10);
          const localHasRecoveredQuiz =
            localQuiz.includes("no tengo sueño") ||
            (Array.isArray(draft.levels?.find((l) => l.id === "level-2")?.content) &&
              (draft.levels?.find((l) => l.id === "level-2")?.content.length ?? 0) >=
                10);
          const diskConnection = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-5")?.content ?? [],
          );
          const localConnection = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-5")?.content ?? [],
          );
          const diskHasRecoveredConnection =
            diskConnection.includes("Te iubesc") ||
            diskConnection.includes("Cómo nos entendemos");
          const localHasRecoveredConnection =
            localConnection.includes("Te iubesc") ||
            localConnection.includes("Cómo nos entendemos");
          const diskDance = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-6")?.content ?? [],
          );
          const localDance = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-6")?.content ?? [],
          );
          const diskHasRecoveredDance =
            diskDance.includes("Dicen que la vida es un baile") ||
            diskDance.includes("/audio/bachata.mp3");
          const localHasRecoveredDance =
            localDance.includes("Dicen que la vida es un baile") ||
            localDance.includes("/audio/bachata.mp3");
          const diskChoice = JSON.stringify(
            disk.levels?.find((l) => l.id === "level-7")?.content ?? [],
          );
          const localChoice = JSON.stringify(
            draft.levels?.find((l) => l.id === "level-7")?.content ?? [],
          );
          const diskHasPrizeChoice =
            diskChoice.includes("elige un premio") ||
            diskChoice.includes('"motif"') ||
            diskChoice.includes("/prizes/");
          const localHasPrizeChoice =
            localChoice.includes("elige un premio") ||
            localChoice.includes('"motif"') ||
            localChoice.includes("/prizes/");

          const diskNoMessages =
            disk.finalQuestion?.noBehavior?.messages?.length ?? 0;
          const localNoMessages =
            draft.finalQuestion?.noBehavior?.messages?.length ?? 0;
          const diskHasRicherNo =
            diskNoMessages > localNoMessages ||
            (disk.finalQuestion?.noBehavior?.messages ?? []).some((m) =>
              String(m).includes("mantenimiento"),
            );
          const localHasRicherNo = (
            draft.finalQuestion?.noBehavior?.messages ?? []
          ).some((m) => String(m).includes("mantenimiento"));
          const diskHasCelebrationMusic =
            Boolean(disk.celebration?.musicSrc) ||
            Boolean(disk.celebration?.achievementTitle);
          const localHasCelebrationMusic =
            Boolean(draft.celebration?.musicSrc) ||
            Boolean(draft.celebration?.achievementTitle);

          // Prefer disk whenever it still holds recovered intro/lab/quiz the browser lost.
          if (
            (diskHasRecoveredIntro && !localHasRecoveredIntro) ||
            (diskHasPersonalizedLab && !localHasPersonalizedLab) ||
            (diskHasPolishedLab && !localHasPolishedLab) ||
            (diskHasRecoveredQuiz && !localHasRecoveredQuiz) ||
            (diskHasRecoveredConnection && !localHasRecoveredConnection) ||
            (diskHasRecoveredDance && !localHasRecoveredDance) ||
            (diskHasPrizeChoice && !localHasPrizeChoice) ||
            (diskHasRicherNo && !localHasRicherNo) ||
            (diskHasCelebrationMusic && !localHasCelebrationMusic) ||
            (JSON.stringify(disk).length || 0) >
              (JSON.stringify(draft).length || 0) + 500
          ) {
            draft = { ...disk, status: "draft" };
          } else if (diskHasRicherNo && disk.finalQuestion) {
            // Keep local edits but bring in the expanded No messages.
            draft = {
              ...draft,
              finalQuestion: {
                ...draft.finalQuestion,
                noBehavior: {
                  ...draft.finalQuestion.noBehavior,
                  messages: disk.finalQuestion.noBehavior.messages,
                },
              },
            };
          } else if (diskHasCelebrationMusic && disk.celebration) {
            draft = {
              ...draft,
              celebration: {
                ...draft.celebration,
                ...disk.celebration,
              },
            };
          }
        }
      } catch {
        // Keep local draft if API unavailable
      }

      const normalized = {
        ...draft,
        id: MONICA_EXPERIENCE_ID,
        recipientName: draft.recipientName || "Mónica",
      };
      saveDraftExperience(normalized);
      mirrorPublishedExperience(normalized);
      set({
        draft: normalized,
        selectedLevelId: null,
        panel: "experience",
        versions: listVersions(MONICA_EXPERIENCE_ID),
        dirty: false,
        diskStatus: "idle",
        message: "Editor cargado · guarda con «Guardar ahora» o «Publicar»",
      });
    })();
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
    commitDraft(get, set, { ...draft, ...patch });
  },

  setTheme: (themeId) => {
    const { draft } = get();
    if (!draft) return;
    const theme = THEMES[themeId];
    commitDraft(get, set, {
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
    });
  },

  updateFinalQuestion: (patch) => {
    const { draft } = get();
    if (!draft) return;
    commitDraft(get, set, {
      ...draft,
      finalQuestion: { ...draft.finalQuestion, ...patch },
    });
  },

  updateNoBehavior: (patch) => {
    const { draft } = get();
    if (!draft) return;
    commitDraft(get, set, {
      ...draft,
      finalQuestion: {
        ...draft.finalQuestion,
        noBehavior: { ...draft.finalQuestion.noBehavior, ...patch },
      },
    });
  },

  updateCelebration: (patch) => {
    const { draft } = get();
    if (!draft) return;
    commitDraft(get, set, {
      ...draft,
      celebration: { ...draft.celebration, ...patch },
    });
  },

  updateFinalReward: (patch) => {
    const { draft } = get();
    if (!draft) return;
    commitDraft(get, set, {
      ...draft,
      finalReward: {
        title: draft.finalReward?.title ?? "",
        body: draft.finalReward?.body ?? "",
        cta: draft.finalReward?.cta,
        ...patch,
      },
    });
  },

  updateLevel: (levelId, patch) => {
    const { draft } = get();
    if (!draft) return;
    commitDraft(get, set, {
      ...draft,
      levels: draft.levels.map((level) =>
        level.id === levelId ? { ...level, ...patch } : level,
      ),
    });
  },

  addLevel: (type = "story") => {
    const { draft } = get();
    if (!draft) return;
    const order = draft.levels.length;
    const id = `level-${Date.now()}`;
    const isPuzzle = type === "sorting";
    const level: Level = {
      id,
      order,
      title: isPuzzle ? "Puzzle de recuerdos" : `Nuevo nivel ${order}`,
      subtitle: isPuzzle ? "Cuatro fotos, cuatro puzzles" : undefined,
      type,
      active: true,
      content: isPuzzle ? createEmptyPuzzleScenes() : [],
      completion: { type: "manual" },
    };
    commitDraft(get, set, { ...draft, levels: [...draft.levels, level] });
    set({ selectedLevelId: id, panel: "level" });
  },

  duplicateLevel: (levelId) => {
    const { draft } = get();
    if (!draft) return;
    const source = draft.levels.find((l) => l.id === levelId);
    if (!source) return;
    const copy: Level = {
      ...structuredClone(source),
      id: `${source.id}-copy-${Date.now()}`,
      order: draft.levels.length,
      title: `${source.title} (copia)`,
    };
    commitDraft(get, set, {
      ...draft,
      levels: sortLevels([...draft.levels, copy]),
    });
  },

  deleteLevel: (levelId) => {
    const { draft, selectedLevelId } = get();
    if (!draft) return;
    const levels = sortLevels(draft.levels.filter((l) => l.id !== levelId));
    commitDraft(get, set, { ...draft, levels });
    if (selectedLevelId === levelId) {
      set({ selectedLevelId: levels[0]?.id ?? null });
    }
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
    commitDraft(get, set, { ...draft, levels: sortLevels(next) });
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
    mirrorPublishedExperience(draft);
    set({ diskStatus: "saving", message: "Guardando y archivando en disco…" });
    void flushExperienceAutosave(
      {
        getExperience: () => get().draft,
        onResult: (result) => {
          set({
            dirty: false,
            diskStatus: result.ok ? "saved" : "error",
            lastSavedAt: new Date().toISOString(),
            message: result.ok
              ? `Guardado forzado en ${result.canonical ?? "monica.json"} (${result.file})`
              : `Fallo al guardar: ${result.error}`,
            versions: listVersions(draft.id),
          });
        },
      },
      true,
    );
  },

  publish: () => {
    const { draft } = get();
    if (!draft) return;
    const published = publishExperience(draft);
    set({
      draft: { ...published, status: "draft" },
      versions: listVersions(published.id),
      dirty: false,
      diskStatus: "saving",
      lastSavedAt: new Date().toISOString(),
      message: `Publicando v${published.version} en disco…`,
    });
    void persistExperienceToDisk(
      published,
      "publish",
      `Published v${published.version}`,
    ).then((result) => {
      set({
        diskStatus: result.ok ? "saved" : "error",
        message: result.ok
          ? `Publicado v${published.version} → ${result.canonical} + archivo ${result.file}`
          : `Publicado en navegador; disco falló: ${result.error}`,
      });
    });
  },

  flushPendingSave: async () => {
    // Autosave disabled — nothing pending on a timer.
    cancelExperienceAutosave();
  },

  restore: (version) => {
    const { draft } = get();
    if (!draft) return;
    const restored = restoreVersion(draft.id, version);
    if (!restored) return;
    commitDraft(get, set, restored, {
      message: `Restaurada v${version} · guardando…`,
    });
    set({
      versions: listVersions(draft.id),
      selectedLevelId: restored.levels[0]?.id ?? null,
    });
  },

  restoreAt: (savedAt) => {
    const { draft } = get();
    if (!draft) return;
    const restored = restoreVersionAt(draft.id, savedAt);
    if (!restored) return;
    commitDraft(get, set, restored, {
      message: "Versión restaurada · guardando…",
    });
    set({
      versions: listVersions(draft.id),
      selectedLevelId: restored.levels[0]?.id ?? null,
    });
  },

  resetSeed: () => {
    const current = get().draft;
    if (current) {
      void persistExperienceToDisk(
        current,
        "backup",
        `Antes de reset v${current.version ?? 1}`,
      );
    }
    // For Monica, reset reloads monica.json — never the empty demo.
    const draft = resetToSeed(MONICA_EXPERIENCE_ID);
    mirrorPublishedExperience(draft);
    void persistExperienceToDisk(draft, "draft", "Reset to monica.json");
    set({
      draft,
      versions: listVersions(draft.id),
      selectedLevelId: draft.levels[0]?.id ?? null,
      dirty: false,
      diskStatus: "saved",
      message: "Borrador recargado desde monica.json (con backup previo).",
    });
  },

  applySeed: () => {
    const current = get().draft;
    if (current) {
      void persistExperienceToDisk(
        current,
        "backup",
        `Antes de recargar archivo v${current.version ?? 1}`,
      );
    }
    // Never pull empty demo into Monica — reload monica.json only.
    const published = applySeedToPlayer(MONICA_EXPERIENCE_ID);
    void persistExperienceToDisk(
      published,
      "publish",
      `Reload monica.json v${published.version}`,
    );
    set({
      draft: { ...published, status: "draft" },
      versions: listVersions(published.id),
      selectedLevelId: published.levels[0]?.id ?? null,
      dirty: false,
      diskStatus: "saved",
      message: `monica.json recargado y publicado como v${published.version}.`,
    });
  },
}));
