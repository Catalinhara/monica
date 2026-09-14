"use client";

import { create } from "zustand";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/storage";
import { playSound, type SoundKind } from "@/lib/sound";

type PrefsState = {
  muted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  play: (kind: SoundKind) => void;
};

export const usePrefsStore = create<PrefsState>((set, get) => ({
  muted: false,
  hydrated: false,
  hydrate: () => {
    set({
      muted: readJson(STORAGE_KEYS.soundMuted, false),
      hydrated: true,
    });
  },
  toggleMute: () => {
    const muted = !get().muted;
    writeJson(STORAGE_KEYS.soundMuted, muted);
    set({ muted });
  },
  setMuted: (muted) => {
    writeJson(STORAGE_KEYS.soundMuted, muted);
    set({ muted });
  },
  play: (kind) => {
    playSound(kind, get().muted);
  },
}));
