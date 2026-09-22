import type { Experience } from "@/types";

export type PersistAction = "draft" | "publish" | "backup" | "autosave";

export type PersistResult = {
  ok: boolean;
  file?: string;
  canonical?: string;
  error?: string;
};

/**
 * Write the experience to disk via the local Next API.
 * Failures are returned (never thrown) so the UI can still save to localStorage.
 */
export async function persistExperienceToDisk(
  experience: Experience,
  action: PersistAction,
  label?: string,
): Promise<PersistResult> {
  try {
    const res = await fetch("/api/experience/persist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ experience, action, label }),
    });
    const raw = await res.text();
    let json: {
      ok?: boolean;
      file?: string;
      canonical?: string;
      error?: string;
    };
    try {
      json = JSON.parse(raw) as typeof json;
    } catch {
      // Dev server often returns an HTML error page while recompiling
      // (e.g. if monica.json briefly became invalid).
      const hint = raw.trimStart().startsWith("<!")
        ? "El servidor devolvió HTML (suele pasar si Next está recompilando o monica.json está roto). Reintenta en unos segundos."
        : `Respuesta no JSON (HTTP ${res.status})`;
      return { ok: false, error: hint };
    }
    if (!res.ok || !json.ok) {
      return { ok: false, error: json.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, file: json.file, canonical: json.canonical };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "persist failed",
    };
  }
}

let autosaveTimer: ReturnType<typeof setTimeout> | null = null;
let lastArchiveAt = 0;
const AUTOSAVE_MS = 900;
const ARCHIVE_MIN_MS = 20_000;

type AutosaveHandlers = {
  getExperience: () => Experience | null;
  onSaving?: () => void;
  onResult?: (result: PersistResult & { archived: boolean }) => void;
};

/**
 * Debounced disk write. Always updates monica.json; archives a versioned
 * snapshot at most every ARCHIVE_MIN_MS (and always on flush/manual).
 */
export function scheduleExperienceAutosave(handlers: AutosaveHandlers): void {
  if (autosaveTimer) clearTimeout(autosaveTimer);
  handlers.onSaving?.();
  autosaveTimer = setTimeout(() => {
    void flushExperienceAutosave(handlers, false);
  }, AUTOSAVE_MS);
}

export async function flushExperienceAutosave(
  handlers: AutosaveHandlers,
  forceArchive: boolean,
): Promise<PersistResult & { archived: boolean }> {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
  const experience = handlers.getExperience();
  if (!experience) {
    const empty = { ok: false as const, error: "No draft", archived: false };
    handlers.onResult?.(empty);
    return empty;
  }

  const now = Date.now();
  const shouldArchive =
    forceArchive || now - lastArchiveAt >= ARCHIVE_MIN_MS;
  const action: PersistAction = shouldArchive ? "draft" : "autosave";
  if (shouldArchive) lastArchiveAt = now;

  handlers.onSaving?.();
  const result = await persistExperienceToDisk(
    experience,
    action,
    shouldArchive ? "Autosave archivado" : "Autosave",
  );
  const packed = { ...result, archived: shouldArchive && result.ok };
  handlers.onResult?.(packed);
  return packed;
}

export function cancelExperienceAutosave(): void {
  if (autosaveTimer) {
    clearTimeout(autosaveTimer);
    autosaveTimer = null;
  }
}
