import type { CompletionRule, Level, Scene } from "@/types";
import { getLevelScenes } from "./level-engine";

export type SceneCursor = {
  index: number;
  scene: Scene | null;
  total: number;
  isFirst: boolean;
  isLast: boolean;
};

export function getSceneCursor(level: Level, index: number): SceneCursor {
  const scenes = getLevelScenes(level);
  const safeIndex = Math.min(Math.max(index, 0), Math.max(scenes.length - 1, 0));
  const scene = scenes[safeIndex] ?? null;

  return {
    index: scenes.length === 0 ? -1 : safeIndex,
    scene,
    total: scenes.length,
    isFirst: safeIndex <= 0,
    isLast: scenes.length === 0 || safeIndex >= scenes.length - 1,
  };
}

export function canAdvanceScene(level: Level, index: number): boolean {
  const scenes = getLevelScenes(level);
  return index < scenes.length - 1;
}

export function canGoBackScene(index: number): boolean {
  return index > 0;
}

export function getSceneProgressPercent(level: Level, index: number): number {
  const scenes = getLevelScenes(level);
  if (scenes.length === 0) return 100;
  return Math.round(((index + 1) / scenes.length) * 100);
}

/**
 * Whether the level can be marked complete given scene position / rule.
 * Mechanics-specific rules (quiz scores, etc.) land in Phase 3.
 */
export function isLevelCompletable(
  level: Level,
  sceneIndex: number,
  options?: { interactionCount?: number; correctAnswers?: number },
): boolean {
  const scenes = getLevelScenes(level);
  const rule: CompletionRule = level.completion;

  switch (rule.type) {
    case "all-scenes":
      return scenes.length === 0 || sceneIndex >= scenes.length - 1;
    case "manual":
      return scenes.length === 0 || sceneIndex >= scenes.length - 1;
    case "interaction-count":
      return (options?.interactionCount ?? 0) >= (rule.threshold ?? 1);
    case "correct-answers":
      return (options?.correctAnswers ?? 0) >= (rule.threshold ?? 1);
    default:
      return sceneIndex >= scenes.length - 1;
  }
}
