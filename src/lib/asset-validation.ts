export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export type AssetValidationError =
  | "missing_file"
  | "invalid_mime"
  | "file_too_large"
  | "invalid_experience_id";

export type MediaKind = "image" | "video";

export function extensionOf(name?: string): string {
  if (!name) return "";
  const parts = name.replace(/\\/g, "/").split("/").pop()?.split(".") ?? [];
  return parts.length > 1 ? (parts.pop() ?? "").toLowerCase() : "";
}

/** Browsers (especially Windows) often send an empty MIME; infer from the name. */
export function resolveMediaMime(file: { type?: string; name?: string }): string {
  const raw = (file.type ?? "").toLowerCase();
  if (ALLOWED_IMAGE_MIME.has(raw) || ALLOWED_VIDEO_MIME.has(raw)) return raw;
  const fromExt = EXT_TO_MIME[extensionOf(file.name)];
  return fromExt ?? raw;
}

export function mediaKindForMime(mime: string): MediaKind | null {
  if (ALLOWED_IMAGE_MIME.has(mime)) return "image";
  if (ALLOWED_VIDEO_MIME.has(mime)) return "video";
  return null;
}

export function maxBytesForKind(kind: MediaKind): number {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export function validateMediaFile(file: {
  type: string;
  size: number;
  name?: string;
}):
  | { ok: true; mime: string; kind: MediaKind }
  | { ok: false; error: AssetValidationError } {
  if (!file) return { ok: false, error: "missing_file" };
  const mime = resolveMediaMime(file);
  const kind = mediaKindForMime(mime);
  if (!kind) return { ok: false, error: "invalid_mime" };
  const max = maxBytesForKind(kind);
  if (file.size <= 0 || file.size > max) {
    return { ok: false, error: "file_too_large" };
  }
  return { ok: true, mime, kind };
}

/** @deprecated Use validateMediaFile. Kept for existing tests. */
export function validateImageFile(file: {
  type: string;
  size: number;
  name?: string;
}): { ok: true } | { ok: false; error: AssetValidationError } {
  const result = validateMediaFile(file);
  if (!result.ok) return result;
  return { ok: true };
}

export function validateExperienceId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(id);
}

/** Strip path segments and unsafe characters from an original filename. */
export function sanitizeBaseName(name: string): string {
  const base =
    name
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? "archivo";
  const slug = base
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
  return slug || "archivo";
}

export function extensionForMime(mime: string): string {
  return MIME_TO_EXT[mime] ?? "bin";
}

export function buildUploadFileName(originalName: string, mime: string): string {
  const stamp = Date.now();
  const unique =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    Math.random().toString(36).slice(2, 10);
  const slug = sanitizeBaseName(originalName);
  const ext = extensionForMime(mime);
  return `${stamp}-${unique}-${slug}.${ext}`;
}

/** Ensure a public URL path stays under /assets/uploads/ and has no traversal. */
export function isSafeUploadUrl(url: string): boolean {
  if (!url.startsWith("/assets/uploads/")) return false;
  if (url.includes("..") || url.includes("\\")) return false;
  return true;
}

export function validationErrorMessage(error: AssetValidationError): string {
  switch (error) {
    case "missing_file":
      return "No se recibió ningún archivo.";
    case "invalid_mime":
      return "Formato no permitido. Usa fotos JPG, PNG o WebP, o vídeos MP4, WebM o MOV.";
    case "file_too_large":
      return `El archivo es demasiado grande. Fotos hasta ${MAX_IMAGE_BYTES / (1024 * 1024)} MB; vídeos hasta ${MAX_VIDEO_BYTES / (1024 * 1024)} MB.`;
    case "invalid_experience_id":
      return "Identificador de experiencia inválido.";
  }
}

export function htmlResponseUploadHint(): string {
  return "El servidor no confirmó la subida (corte puntual al procesar el lote). Vuelve a intentar esos archivos.";
}
