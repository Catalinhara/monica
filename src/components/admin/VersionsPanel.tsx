"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";

export function VersionsPanel() {
  const versions = useAdminStore((s) => s.versions);
  const restore = useAdminStore((s) => s.restore);
  const resetSeed = useAdminStore((s) => s.resetSeed);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Versiones</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cada Publish crea un snapshot local restaurable.
        </p>
      </header>

      {versions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Aún no hay versiones. Publica para crear la primera.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {versions.map((version) => (
            <li key={`${version.version}-${version.savedAt}`}>
              <Surface className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium">{version.label}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {new Date(version.savedAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => restore(version.version)}
                >
                  Restaurar
                </Button>
              </Surface>
            </li>
          ))}
        </ul>
      )}

      <Button variant="ghost" onClick={resetSeed}>
        Resetear borrador al seed demo
      </Button>
    </div>
  );
}
