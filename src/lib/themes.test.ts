import { describe, expect, it } from "vitest";
import { resolveTheme, themeToCssVars, THEMES } from "@/lib/themes";

describe("visual themes", () => {
  it("resolves known theme ids", () => {
    expect(resolveTheme("burgundy").name).toBe("Burgundy");
    expect(Object.keys(THEMES)).toHaveLength(5);
  });

  it("falls back to romantic-night", () => {
    expect(resolveTheme("unknown").id).toBe("romantic-night");
  });

  it("exports css variables for scoping", () => {
    const vars = themeToCssVars(resolveTheme("soft-sunset"));
    expect(vars["--accent"]).toBeTruthy();
    expect(vars["--atmosphere-gradient"]).toContain("gradient");
  });
});
