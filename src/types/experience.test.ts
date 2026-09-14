import { describe, expect, it } from "vitest";
import type { Experience } from "@/types";
import demo from "../../content/experiences/demo.json";

describe("demo experience config", () => {
  it("matches the Experience shape", () => {
    const experience = demo as Experience;
    expect(experience.id).toBe("exp-demo-001");
    expect(experience.levels.length).toBeGreaterThan(0);
    expect(experience.finalQuestion.prompt).toContain("novia");
  });
});
