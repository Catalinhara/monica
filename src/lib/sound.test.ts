import { describe, expect, it, vi } from "vitest";
import { playSound } from "@/lib/sound";

describe("playSound", () => {
  it("no-ops when muted", () => {
    const AudioContextMock = vi.fn();
    vi.stubGlobal("AudioContext", AudioContextMock);
    playSound("tap", true);
    expect(AudioContextMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
