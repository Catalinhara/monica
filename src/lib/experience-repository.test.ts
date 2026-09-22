import { describe, expect, it } from "vitest";
import { getSeedExperience, MONICA_EXPERIENCE_ID } from "@/lib/experience-repository";
import { loadExperience } from "@/engine";

describe("experience repository / loader", () => {
  it("loads Monica seed experience for play by default", () => {
    const experience = loadExperience();
    expect(experience.id).toBe(MONICA_EXPERIENCE_ID);
    expect(experience.levels.length).toBeGreaterThan(5);
    expect(experience.finalQuestion.prompt).toContain("novia");
  });

  it("still loads legacy demo seed by id", () => {
    const experience = loadExperience("exp-demo-001");
    expect(experience.id).toBe("exp-demo-001");
    expect(experience.levels.length).toBeGreaterThan(5);
  });

  it("clones seed without sharing references", () => {
    const a = getSeedExperience();
    const b = getSeedExperience();
    a.title = "changed";
    expect(b.title).not.toBe("changed");
  });
});
