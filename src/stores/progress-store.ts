"use client";

import { create } from "zustand";
import type { LevelProgress } from "@/types";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/storage";

type ProgressState = {
  levels: Record<string, LevelProgress>;
  hydrate: () => void;
  setLevelProgress: (progress: LevelProgress) => void;
  reset: () => void;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  levels: {},
  hydrate: () => {
    const levels = readJson<Record<string, LevelProgress>>(
      STORAGE_KEYS.playerProgress,
      {},
    );
    set({ levels });
  },
  setLevelProgress: (progress) => {
    const levels = { ...get().levels, [progress.levelId]: progress };
    writeJson(STORAGE_KEYS.playerProgress, levels);
    set({ levels });
  },
  reset: () => {
    writeJson(STORAGE_KEYS.playerProgress, {});
    set({ levels: {} });
  },
}));
