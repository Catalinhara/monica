import type { Experience, Level } from "@/types";

/** Active levels sorted by `order`. */
export function getOrderedLevels(experience: Experience): Level[] {
  return experience.levels
    .filter((level) => level.active !== false)
    .slice()
    .sort((a, b) => a.order - b.order);
}

export function getLevelById(
  experience: Experience,
  levelId: string,
): Level | undefined {
  return getOrderedLevels(experience).find((level) => level.id === levelId);
}

export function getNextLevel(
  experience: Experience,
  currentLevelId: string,
): Level | undefined {
  const levels = getOrderedLevels(experience);
  const index = levels.findIndex((level) => level.id === currentLevelId);
  if (index < 0 || index >= levels.length - 1) return undefined;
  return levels[index + 1];
}

export function getPreviousLevel(
  experience: Experience,
  currentLevelId: string,
): Level | undefined {
  const levels = getOrderedLevels(experience);
  const index = levels.findIndex((level) => level.id === currentLevelId);
  if (index <= 0) return undefined;
  return levels[index - 1];
}

export function getFirstLevel(experience: Experience): Level | undefined {
  return getOrderedLevels(experience)[0];
}

export function getLevelIndex(
  experience: Experience,
  levelId: string,
): number {
  return getOrderedLevels(experience).findIndex((level) => level.id === levelId);
}

/** Intro + content scenes in play order. */
export function getLevelScenes(level: Level) {
  return level.intro ? [level.intro, ...level.content] : level.content;
}
