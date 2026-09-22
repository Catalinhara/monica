import { beforeEach, describe, expect, it } from "vitest";
import {
  findAsset,
  listAssets,
  removeAssetMeta,
  saveAssetMeta,
  updateAssetAlt,
} from "@/lib/asset-repository";
import type { Asset } from "@/types";

describe("asset-repository", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves, lists, updates alt and removes assets", () => {
    const asset: Asset = {
      id: "a1",
      type: "image",
      url: "/assets/uploads/exp-demo-001/1-photo.jpg",
      experienceId: "exp-demo-001",
      name: "photo.jpg",
    };

    saveAssetMeta(asset);
    expect(listAssets("exp-demo-001")).toHaveLength(1);
    expect(findAsset("exp-demo-001", "a1")?.url).toContain("photo.jpg");

    updateAssetAlt("exp-demo-001", "a1", "Nuestro viaje");
    expect(findAsset("exp-demo-001", "a1")?.alt).toBe("Nuestro viaje");

    removeAssetMeta("exp-demo-001", "a1");
    expect(listAssets("exp-demo-001")).toHaveLength(0);
  });
});
