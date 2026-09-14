"use client";

import { Surface } from "@/components/shared/Surface";

const PLACEHOLDER_ASSETS = [
  { id: "img-cover", type: "image", label: "Portada (placeholder)" },
  { id: "img-memory-1", type: "image", label: "Memoria 01 (placeholder)" },
  { id: "audio-theme", type: "audio", label: "Tema musical (placeholder)" },
];

export function AssetsPanel() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Asset Manager</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stub de Fase 4: catálogo local. La subida real de archivos puede
          llegar en polish / backend.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {PLACEHOLDER_ASSETS.map((asset) => (
          <li key={asset.id}>
            <Surface className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{asset.label}</p>
                <p className="text-xs text-[var(--muted)]">
                  {asset.type} · {asset.id}
                </p>
              </div>
              <span className="text-xs text-[var(--muted)]">Reutilizable</span>
            </Surface>
          </li>
        ))}
      </ul>
    </div>
  );
}
