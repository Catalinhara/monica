import { describe, expect, it } from "vitest";
import {
  buildUploadFileName,
  isSafeUploadUrl,
  sanitizeBaseName,
  validateExperienceId,
  validateImageFile,
  validateMediaFile,
} from "@/lib/asset-validation";

describe("asset-validation", () => {
  it("accepts valid jpeg under size limit", () => {
    expect(
      validateImageFile({ type: "image/jpeg", size: 1024, name: "a.jpg" }),
    ).toEqual({ ok: true });
  });

  it("rejects invalid mime and oversized files", () => {
    expect(
      validateImageFile({ type: "application/pdf", size: 10, name: "a.pdf" }),
    ).toMatchObject({ ok: false, error: "invalid_mime" });
    expect(
      validateImageFile({
        type: "image/png",
        size: 11 * 1024 * 1024,
        name: "big.png",
      }),
    ).toMatchObject({ ok: false, error: "file_too_large" });
    expect(
      validateMediaFile({
        type: "video/mp4",
        size: 1024,
        name: "clip.mp4",
      }),
    ).toMatchObject({ ok: true, kind: "video" });
    expect(
      validateMediaFile({
        type: "",
        size: 2048,
        name: "foto.JPG",
      }),
    ).toMatchObject({ ok: true, mime: "image/jpeg", kind: "image" });
  });

  it("sanitizes names and blocks path traversal in urls", () => {
    expect(sanitizeBaseName("../../Evil Photo!!.PNG")).toBe("evil-photo");
    expect(buildUploadFileName("My Trip.jpg", "image/jpeg")).toMatch(
      /^\d+-[a-z0-9]+-my-trip\.jpg$/i,
    );
    expect(isSafeUploadUrl("/assets/uploads/exp/a.jpg")).toBe(true);
    expect(isSafeUploadUrl("/assets/uploads/../secret.jpg")).toBe(false);
    expect(validateExperienceId("exp-demo-001")).toBe(true);
    expect(validateExperienceId("../x")).toBe(false);
  });
});
