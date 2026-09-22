"use client";

import { useEffect, useRef, useState } from "react";
import type { Asset } from "@/types";
import { useAssetStore } from "@/stores/asset-store";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";

type Props = {
  experienceId: string;
  valueUrl?: string;
  onSelect: (asset: Asset) => void;
  onClear?: () => void;
  label?: string;
};

export function AssetPicker({
  experienceId,
  valueUrl,
  onSelect,
  onClear,
  label = "Imagen",
}: Props) {
  const hydrate = useAssetStore((s) => s.hydrate);
  const assets = useAssetStore((s) => s.assets);
  const uploading = useAssetStore((s) => s.uploading);
  const uploadFiles = useAssetStore((s) => s.uploadFiles);
  const error = useAssetStore((s) => s.error);

  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    hydrate(experienceId);
  }, [hydrate, experienceId]);

  const selected = assets.find((asset) => asset.url === valueUrl);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    const before = new Set(assets.map((a) => a.id));
    await uploadFiles(files);
    const fresh = useAssetStore
      .getState()
      .assets.find((asset) => !before.has(asset.id));
    if (fresh) {
      onSelect(fresh);
      setOpen(false);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-[var(--muted)]">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
            {open ? "Cerrar catálogo" : "Elegir asset"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Subiendo…" : "Subir nueva"}
          </Button>
          {valueUrl && onClear && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Quitar
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files)}
        />
      </div>

          {valueUrl ? (
        <Surface className="flex items-center gap-3 overflow-hidden p-2">
          {selected?.type === "video" ? (
            <video
              src={valueUrl}
              className="h-16 w-16 rounded-lg object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={valueUrl}
              alt={selected?.alt ?? "Seleccionada"}
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selected?.name ?? "Imagen vinculada"}
            </p>
            <p className="truncate font-mono text-[11px] text-[var(--muted)]">
              {valueUrl}
            </p>
          </div>
        </Surface>
      ) : (
        <p className="text-sm text-[var(--muted)]">Ninguna imagen seleccionada.</p>
      )}

      {error && (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      {open && (
        <div className="max-h-64 overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/25 p-3">
          {assets.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
              Catálogo vacío. Sube una foto o ve al panel Assets.
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {assets.map((asset) => {
                const active = asset.url === valueUrl;
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(asset);
                        setOpen(false);
                      }}
                      className={`block w-full overflow-hidden rounded-lg border transition ${
                        active
                          ? "border-[var(--accent)]"
                          : "border-transparent hover:border-[var(--border)]"
                      }`}
                    >
                      {asset.type === "video" ? (
                        <video
                          src={asset.url}
                          className="aspect-square w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={asset.url}
                          alt={asset.alt ?? asset.name ?? "Asset"}
                          className="aspect-square w-full object-cover"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
