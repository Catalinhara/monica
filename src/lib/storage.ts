const isBrowser = () => typeof window !== "undefined";

export function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key);
}

export const STORAGE_KEYS = {
  experienceDraft: "rj:experience:draft",
  experiencePublished: "rj:experience:published",
  playerProgress: "rj:player:progress",
  soundMuted: "rj:prefs:sound-muted",
  assets: "rj:assets",
} as const;
