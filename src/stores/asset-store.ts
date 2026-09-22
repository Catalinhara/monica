"use client";

import { create } from "zustand";
import type { Asset } from "@/types";
import {
  listAssets,
  removeAssetMeta,
  saveAssetMeta,
  updateAssetAlt as updateAltInRepo,
} from "@/lib/asset-repository";
import {
  htmlResponseUploadHint,
  validateMediaFile,
  validationErrorMessage,
} from "@/lib/asset-validation";

const RETRY_DELAYS_MS = [400, 1000, 2000, 3500];

type AssetStoreState = {
  experienceId: string;
  assets: Asset[];
  uploading: boolean;
  error: string | null;
  hydrated: boolean;
  hydrate: (experienceId: string) => void;
  uploadFiles: (files: FileList | File[], alt?: string) => Promise<Asset[]>;
  deleteAsset: (assetId: string) => Promise<void>;
  updateAlt: (assetId: string, alt: string) => void;
  clearError: () => void;
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isRetryableStatus(status: number) {
  return status >= 500 || status === 408 || status === 429 || status === 404;
}

async function postAssetFile(
  file: File,
  experienceId: string,
  alt?: string,
): Promise<{ asset?: Asset; error?: string; retryable: boolean }> {
  try {
    const body = new FormData();
    body.append("file", file);
    body.append("experienceId", experienceId);
    if (alt) body.append("alt", alt);

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body,
    });
    const raw = await response.text();

    let payload: { asset?: Asset; error?: string } = {};
    try {
      payload = raw ? (JSON.parse(raw) as { asset?: Asset; error?: string }) : {};
    } catch {
      return { error: htmlResponseUploadHint(), retryable: true };
    }

    if (response.ok && payload.asset) {
      return { asset: payload.asset, retryable: false };
    }

    return {
      error: payload.error ?? "Error al subir el archivo.",
      retryable: isRetryableStatus(response.status),
    };
  } catch {
    return {
      error: "Se perdió la conexión al subir. Se reintenta automáticamente.",
      retryable: true,
    };
  }
}

async function uploadWithRetries(
  file: File,
  experienceId: string,
  alt?: string,
): Promise<{ asset?: Asset; error?: string }> {
  let lastError = "Error al subir el archivo.";

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const result = await postAssetFile(file, experienceId, alt);
    if (result.asset) return { asset: result.asset };
    lastError = result.error ?? lastError;
    if (!result.retryable || attempt === RETRY_DELAYS_MS.length) {
      return { error: lastError };
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }

  return { error: lastError };
}

export const useAssetStore = create<AssetStoreState>((set, get) => ({
  experienceId: "exp-demo-001",
  assets: [],
  uploading: false,
  error: null,
  hydrated: false,

  hydrate: (experienceId) => {
    set({
      experienceId,
      assets: listAssets(experienceId),
      hydrated: true,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  uploadFiles: async (files, alt) => {
    const list = Array.from(files);
    if (list.length === 0) return get().assets;

    const { experienceId } = get();
    set({ uploading: true, error: null });

    const uploaded: Asset[] = [];
    const failures: string[] = [];
    try {
      for (const file of list) {
        const validation = validateMediaFile({
          type: file.type,
          size: file.size,
          name: file.name,
        });
        if (!validation.ok) {
          failures.push(`${file.name}: ${validationErrorMessage(validation.error)}`);
          continue;
        }

        const result = await uploadWithRetries(file, experienceId, alt);
        if (!result.asset) {
          failures.push(`${file.name}: ${result.error ?? "Error al subir el archivo."}`);
          continue;
        }

        const next = saveAssetMeta(result.asset);
        uploaded.push(result.asset);
        set({ assets: next });
      }

      if (failures.length > 0) {
        const summary =
          uploaded.length > 0
            ? `Se subieron ${uploaded.length} archivo(s). No se pudieron subir ${failures.length}: ${failures.join(" · ")}`
            : failures.join(" · ");
        set({ error: summary });
      }
      return get().assets;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al subir el archivo.";
      set({ error: message });
      return get().assets;
    } finally {
      set({ uploading: false });
    }
  },

  deleteAsset: async (assetId) => {
    const { experienceId, assets } = get();
    const target = assets.find((item) => item.id === assetId);
    if (!target) return;

    set({ error: null });
    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target.url }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar el archivo.");
      }
      const next = removeAssetMeta(experienceId, assetId);
      set({ assets: next });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo eliminar.";
      set({ error: message });
    }
  },

  updateAlt: (assetId, alt) => {
    const { experienceId } = get();
    const next = updateAltInRepo(experienceId, assetId, alt);
    set({ assets: next });
  },
}));

export function formatAssetError(code: Parameters<typeof validationErrorMessage>[0]): string {
  return validationErrorMessage(code);
}
