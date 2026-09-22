import { describe, expect, it } from "vitest";
import type { Experience } from "@/types";
import demo from "../../content/experiences/demo.json";
import monica from "../../content/experiences/monica.json";

describe("experience configs", () => {
  it("demo matches the Experience shape", () => {
    const experience = demo as Experience;
    expect(experience.id).toBe("exp-demo-001");
    expect(experience.levels.length).toBeGreaterThan(0);
    expect(experience.finalQuestion.prompt).toContain("novia");
  });

  it("monica is the permanent Mónica journey", () => {
    const experience = monica as Experience;
    expect(experience.id).toBe("exp-monica-001");
    expect(experience.recipientName).toBe("Mónica");
    expect(experience.levels.length).toBe(9);
    const memories = experience.levels.find((l) => l.id === "level-1");
    expect(memories?.content.length).toBe(6);
    expect(JSON.stringify(memories)).toContain("Shopping y cena");
  });
});
