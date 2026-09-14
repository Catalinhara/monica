import { describe, expect, it } from "vitest";
import {
  canAccessLevel,
  completeLevel,
  createInitialProgress,
  getCurrentPlayableLevel,
  getJourneyProgressPercent,
  getNextLevel,
  getOrderedLevels,
  getSceneCursor,
  isLevelCompletable,
  loadExperience,
  startLevel,
} from "@/engine";

describe("Experience Engine", () => {
  const experience = loadExperience("exp-demo-001");

  it("loads ordered active levels from config", () => {
    const levels = getOrderedLevels(experience);
    expect(levels.length).toBe(9);
    expect(levels[0].id).toBe("level-0");
    expect(levels.at(-1)?.type).toBe("final");
    expect(levels.map((l) => l.type)).toEqual([
      "story",
      "memory",
      "quiz",
      "sorting",
      "compatibility",
      "story",
      "interactive",
      "choice",
      "final",
    ]);
  });

  it("starts with first level available and others locked", () => {
    const progress = createInitialProgress(experience);
    expect(progress["level-0"].status).toBe("available");
    expect(progress["level-1"].status).toBe("locked");
    expect(canAccessLevel(progress, "level-1")).toBe(false);
  });

  it("unlocks the next level on completion", () => {
    let progress = createInitialProgress(experience);
    progress = startLevel(progress, "level-0");
    progress = completeLevel(experience, progress, "level-0");

    expect(progress["level-0"].status).toBe("completed");
    expect(progress["level-1"].status).toBe("available");
    expect(getNextLevel(experience, "level-0")?.id).toBe("level-1");
    expect(getCurrentPlayableLevel(experience, progress)?.id).toBe("level-1");
    expect(getJourneyProgressPercent(experience, progress)).toBe(11);
  });

  it("tracks scene cursor and completion readiness", () => {
    const level = experience.levels[0];
    const first = getSceneCursor(level, 0);
    const last = getSceneCursor(level, level.content.length - 1);

    expect(first.isFirst).toBe(true);
    expect(first.isLast).toBe(false);
    expect(last.isLast).toBe(true);
    expect(isLevelCompletable(level, last.index)).toBe(true);
  });
});
