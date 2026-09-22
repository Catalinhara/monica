import type { Asset } from "@/types";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/storage";

function catalogKey(experienceId: string) {
  return `${STORAGE_KEYS.assets}:${experienceId}`;
}

export function listAssets(experienceId: string): Asset[] {
  return readJson<Asset[]>(catalogKey(experienceId), []);
}

export function saveAssetMeta(asset: Asset): Asset[] {
  const experienceId = asset.experienceId ?? "exp-demo-001";
  const current = listAssets(experienceId);
  const index = current.findIndex((item) => item.id === asset.id);
  const next =
    index >= 0
      ? current.map((item, i) => (i === index ? asset : item))
      : [asset, ...current];
  writeJson(catalogKey(experienceId), next);
  return next;
}

export function removeAssetMeta(
  experienceId: string,
  assetId: string,
): Asset[] {
  const next = listAssets(experienceId).filter((item) => item.id !== assetId);
  writeJson(catalogKey(experienceId), next);
  return next;
}

export function updateAssetAlt(
  experienceId: string,
  assetId: string,
  alt: string,
): Asset[] {
  const current = listAssets(experienceId);
  const next = current.map((item) =>
    item.id === assetId ? { ...item, alt } : item,
  );
  writeJson(catalogKey(experienceId), next);
  return next;
}

export function findAsset(
  experienceId: string,
  assetId: string,
): Asset | undefined {
  return listAssets(experienceId).find((item) => item.id === assetId);
}
