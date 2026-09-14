"use client";

import { create } from "zustand";
import type { Experience, Level, LevelProgress } from "@/types";
import { writeJson, readJson, STORAGE_KEYS } from "@/lib/storage";
import {
  canAccessLevel,
  canAdvanceScene,
  canGoBackScene,
  completeLevel as completeLevelProgress,
  createInitialProgress,
  getCurrentPlayableLevel,
  getLevelById,
  getLevelScenes,
  isLevelCompletable,
  loadExperience,
  reconcileProgress,
  startLevel as startLevelProgress,
} from "@/engine";

type SessionPhase = "boot" | "map" | "level" | "celebration" | "complete";

type ExperienceSessionState = {
  experience: Experience | null;
  progress: Record<string, LevelProgress>;
  currentLevelId: string | null;
  sceneIndex: number;
  phase: SessionPhase;
  hydrated: boolean;
  boot: (experienceId?: string) => void;
  openMap: () => void;
  enterLevel: (levelId: string) => boolean;
  nextScene: () => void;
  prevScene: () => void;
  completeCurrentLevel: () => void;
  acceptProposal: () => void;
  finishCelebration: () => void;
  resetJourney: () => void;
  getCurrentLevel: () => Level | null;
};

function persistProgress(
  experienceId: string,
  progress: Record<string, LevelProgress>,
) {
  writeJson(`${STORAGE_KEYS.playerProgress}:${experienceId}`, progress);
}

function loadSavedProgress(experienceId: string) {
  return readJson<Record<string, LevelProgress>>(
    `${STORAGE_KEYS.playerProgress}:${experienceId}`,
    {},
  );
}

export const useExperienceSession = create<ExperienceSessionState>((set, get) => ({
  experience: null,
  progress: {},
  currentLevelId: null,
  sceneIndex: 0,
  phase: "boot",
  hydrated: false,

  boot: (experienceId = "exp-demo-001") => {
    const experience = loadExperience(experienceId);
    const saved = loadSavedProgress(experience.id);
    const progress =
      Object.keys(saved).length > 0
        ? reconcileProgress(experience, saved)
        : createInitialProgress(experience);

    persistProgress(experience.id, progress);

    set({
      experience,
      progress,
      currentLevelId: getCurrentPlayableLevel(experience, progress)?.id ?? null,
      sceneIndex: 0,
      phase: "map",
      hydrated: true,
    });
  },

  openMap: () => set({ phase: "map", currentLevelId: null, sceneIndex: 0 }),

  enterLevel: (levelId) => {
    const { experience, progress } = get();
    if (!experience) return false;
    if (!canAccessLevel(progress, levelId)) return false;
    if (!getLevelById(experience, levelId)) return false;

    const nextProgress = startLevelProgress(progress, levelId);
    persistProgress(experience.id, nextProgress);

    set({
      progress: nextProgress,
      currentLevelId: levelId,
      sceneIndex: 0,
      phase: "level",
    });
    return true;
  },

  nextScene: () => {
    const { experience, currentLevelId, sceneIndex } = get();
    if (!experience || !currentLevelId) return;
    const level = getLevelById(experience, currentLevelId);
    if (!level) return;

    if (canAdvanceScene(level, sceneIndex)) {
      set({ sceneIndex: sceneIndex + 1 });
      return;
    }

    if (isLevelCompletable(level, sceneIndex)) {
      get().completeCurrentLevel();
    }
  },

  prevScene: () => {
    const { sceneIndex } = get();
    if (!canGoBackScene(sceneIndex)) return;
    set({ sceneIndex: sceneIndex - 1 });
  },

  completeCurrentLevel: () => {
    const { experience, progress, currentLevelId } = get();
    if (!experience || !currentLevelId) return;

    const nextProgress = completeLevelProgress(
      experience,
      progress,
      currentLevelId,
    );
    persistProgress(experience.id, nextProgress);

    const level = getLevelById(experience, currentLevelId);
    const scenes = level ? getLevelScenes(level) : [];
    const ordered = experience.levels.filter((l) => l.active !== false);
    const allDone = ordered.every(
      (item) => nextProgress[item.id]?.status === "completed",
    );

    set({
      progress: nextProgress,
      phase: allDone ? "complete" : "map",
      currentLevelId: allDone ? currentLevelId : null,
      sceneIndex: allDone ? Math.max(scenes.length - 1, 0) : 0,
    });
  },

  acceptProposal: () => {
    const { experience, progress, currentLevelId } = get();
    if (!experience || !currentLevelId) return;

    const nextProgress = completeLevelProgress(
      experience,
      progress,
      currentLevelId,
    );
    persistProgress(experience.id, nextProgress);

    set({
      progress: nextProgress,
      phase: "celebration",
    });
  },

  finishCelebration: () => set({ phase: "complete", currentLevelId: null }),

  resetJourney: () => {
    const { experience } = get();
    if (!experience) return;
    const progress = createInitialProgress(experience);
    persistProgress(experience.id, progress);
    set({
      progress,
      currentLevelId: null,
      sceneIndex: 0,
      phase: "map",
    });
  },

  getCurrentLevel: () => {
    const { experience, currentLevelId } = get();
    if (!experience || !currentLevelId) return null;
    return getLevelById(experience, currentLevelId) ?? null;
  },
}));
