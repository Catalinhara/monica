/**
 * Experience Engine — Level, Progression, Scene and registry APIs.
 */

export type { LevelRenderer, ValidationResult } from "./types";
export {
  getOrderedLevels,
  getLevelById,
  getNextLevel,
  getPreviousLevel,
  getFirstLevel,
  getLevelIndex,
  getLevelScenes,
} from "./level-engine";
export {
  createInitialProgress,
  reconcileProgress,
  canAccessLevel,
  startLevel,
  completeLevel,
  getCurrentPlayableLevel,
  getJourneyProgressPercent,
  getStatusLabel,
} from "./progression-engine";
export {
  getSceneCursor,
  canAdvanceScene,
  canGoBackScene,
  getSceneProgressPercent,
  isLevelCompletable,
} from "./scene-engine";
export type { SceneCursor } from "./scene-engine";
export { loadExperience, listExperienceIds } from "./load-experience";
export { getLevelRenderer, registerLevelRenderer } from "./level-registry";
