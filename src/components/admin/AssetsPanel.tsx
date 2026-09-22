"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useAdminStore } from "@/stores/admin-store";
import { useAssetStore } from "@/stores/asset-store";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { Field, TextInput } from "./fields";
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from "@/lib/asset-validation";

function formatBytes(size?: number): string {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AssetsPanel() {
  const draft = useAdminStore((s) => s.draft);
  const experienceId = draft?.id ?? "exp-demo-001";

  const hydrate = useAssetStore((s) => s.hydrate);
  const assets = useAssetStore((s) => s.assets);
  const uploading = useAssetStore((s) => s.uploading);
  const error = useAssetStore((s) => s.error);
  const uploadFiles = useAssetStore((s) => s.uploadFiles);
  const deleteAsset = useAssetStore((s) => s.deleteAsset);
  const updateAlt = useAssetStore((s) => s.updateAlt);
  const clearError = useAssetStore((s) => s.clearError);

  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    hydrate(experienceId);
  }, [hydrate, experienceId]);

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || (Array.isArray(files) ? files.length === 0 : files.length === 0)) {
      return;
    }
    clearError();
    await uploadFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void handleFiles(event.dataTransfer.files);
  }

  async function copyUrl(id: string, url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Asset Manager</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Sube fotos JPG/PNG/WebP (máx. {MAX_IMAGE_BYTES / (1024 * 1024)} MB)
          o vídeos MP4/WebM/MOV (máx. {MAX_VIDEO_BYTES / (1024 * 1024)} MB). Se
          guardan en <code className="text-[var(--accent)]">/assets/uploads</code>{" "}
          y el catálogo queda en este navegador.
        </p>
      </header>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-[var(--radius-lg)] border border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-[var(--accent)] bg-[var(--accent-soft)]"
            : "border-[var(--border)] bg-black/20 hover:border-[var(--accent)]/50"
        }`}
      >
        <p className="font-display text-xl">
          {uploading ? "Subiendo…" : "Arrastra fotos o vídeos aquí o haz clic"}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Puedes seleccionar varios archivos. Si uno falla, el resto sigue subiendo.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {assets.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Todavía no hay assets. Sube la primera foto del viaje.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <li key={asset.id}>
              <Surface className="overflow-hidden">
                {asset.type === "video" ? (
                  <video
                    src={asset.url}
                    className="h-40 w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.alt ?? asset.name ?? "Asset"}
                    className="h-40 w-full object-cover"
                  />
                )}
                <div className="flex flex-col gap-3 p-4">
                  <div>
                    <p className="truncate text-sm font-medium">
                      {asset.name ?? asset.id}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatBytes(asset.sizeBytes)} · {asset.mimeType ?? asset.type}
                    </p>
                    <p className="mt-1 truncate font-mono text-[11px] text-[var(--muted)]">
                      {asset.url}
                    </p>
                  </div>

                  <Field label="Alt / descripción">
                    <TextInput
                      value={asset.alt ?? ""}
                      onChange={(e) => updateAlt(asset.id, e.target.value)}
                      placeholder="Descripción accesible"
                    />
                  </Field>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void copyUrl(asset.id, asset.url)}
                    >
                      {copiedId === asset.id ? "Copiado" : "Copiar URL"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void deleteAsset(asset.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
