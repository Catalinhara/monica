import type { Experience, Level, LevelProgress, LevelStatus } from "@/types";
import { getFirstLevel, getNextLevel, getOrderedLevels } from "./level-engine";

export function createInitialProgress(
  experience: Experience,
): Record<string, LevelProgress> {
  const levels = getOrderedLevels(experience);
  const progress: Record<string, LevelProgress> = {};

  levels.forEach((level, index) => {
    progress[level.id] = {
      levelId: level.id,
      status: index === 0 ? "available" : "locked",
    };
  });

  return progress;
}

/** Merge saved progress with current experience shape (new levels stay locked). */
export function reconcileProgress(
  experience: Experience,
  saved: Record<string, LevelProgress>,
): Record<string, LevelProgress> {
  const initial = createInitialProgress(experience);
  const levels = getOrderedLevels(experience);

  for (const level of levels) {
    const existing = saved[level.id];
    if (existing) {
      initial[level.id] = existing;
    }
  }

  // Ensure at least the first incomplete level is available.
  ensureAvailability(experience, initial);
  return initial;
}

function ensureAvailability(
  experience: Experience,
  progress: Record<string, LevelProgress>,
): void {
  const levels = getOrderedLevels(experience);
  if (levels.length === 0) return;

  const first = levels[0];
  if (progress[first.id]?.status === "locked") {
    progress[first.id] = { ...progress[first.id], status: "available" };
  }

  for (let i = 0; i < levels.length - 1; i++) {
    const current = progress[levels[i].id];
    const next = progress[levels[i + 1].id];
    if (current?.status === "completed" && next?.status === "locked") {
      progress[levels[i + 1].id] = { ...next, status: "available" };
    }
  }
}

export function canAccessLevel(
  progress: Record<string, LevelProgress>,
  levelId: string,
): boolean {
  const status = progress[levelId]?.status;
  return status === "available" || status === "in_progress" || status === "completed";
}

export function startLevel(
  progress: Record<string, LevelProgress>,
  levelId: string,
): Record<string, LevelProgress> {
  const current = progress[levelId];
  if (!current || current.status === "locked") return progress;
  if (current.status === "completed") return progress;

  return {
    ...progress,
    [levelId]: {
      ...current,
      status: "in_progress",
      attempts: (current.attempts ?? 0) + (current.status === "available" ? 1 : 0),
    },
  };
}

export function completeLevel(
  experience: Experience,
  progress: Record<string, LevelProgress>,
  levelId: string,
  score?: number,
): Record<string, LevelProgress> {
  const current = progress[levelId];
  if (!current) return progress;

  const next: Record<string, LevelProgress> = {
    ...progress,
    [levelId]: {
      ...current,
      status: "completed",
      completedAt: new Date().toISOString(),
      score: score ?? current.score,
    },
  };

  const following = getNextLevel(experience, levelId);
  if (following) {
    const followingProgress = next[following.id];
    if (followingProgress && followingProgress.status === "locked") {
      next[following.id] = {
        ...followingProgress,
        status: "available",
      };
    }
  }

  return next;
}

export function getCurrentPlayableLevel(
  experience: Experience,
  progress: Record<string, LevelProgress>,
): Level | undefined {
  const levels = getOrderedLevels(experience);

  const inProgress = levels.find(
    (level) => progress[level.id]?.status === "in_progress",
  );
  if (inProgress) return inProgress;

  const available = levels.find(
    (level) => progress[level.id]?.status === "available",
  );
  if (available) return available;

  const allCompleted = levels.every(
    (level) => progress[level.id]?.status === "completed",
  );
  if (allCompleted) return levels[levels.length - 1];

  return getFirstLevel(experience);
}

export function getJourneyProgressPercent(
  experience: Experience,
  progress: Record<string, LevelProgress>,
): number {
  const levels = getOrderedLevels(experience);
  if (levels.length === 0) return 0;
  const completed = levels.filter(
    (level) => progress[level.id]?.status === "completed",
  ).length;
  return Math.round((completed / levels.length) * 100);
}

export function getStatusLabel(status: LevelStatus): string {
  switch (status) {
    case "locked":
      return "Bloqueado";
    case "available":
      return "Disponible";
    case "in_progress":
      return "En curso";
    case "completed":
      return "Completado";
  }
}
