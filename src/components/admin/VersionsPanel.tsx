"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";

export function VersionsPanel() {
  const versions = useAdminStore((s) => s.versions);
  const restoreAt = useAdminStore((s) => s.restoreAt);
  const resetSeed = useAdminStore((s) => s.resetSeed);
  const applySeed = useAdminStore((s) => s.applySeed);
  const message = useAdminStore((s) => s.message);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Versiones</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Al guardar o publicar se actualiza{" "}
          <code className="text-[var(--accent)]">
            content/experiences/monica.json
          </code>{" "}
          y se llevan copias recientes en{" "}
          <code className="text-[var(--accent)]">
            content/experiences/versions/
          </code>
          .
        </p>
      </header>

      <Surface className="space-y-3 p-4">
        <p className="text-sm text-[var(--muted)]">
          <strong>Peligro:</strong> «Aplicar seed» reemplaza el player con el
          archivo del código. Solo si sabes lo que haces.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={applySeed}>
            Aplicar seed y publicar
          </Button>
          <Button variant="ghost" onClick={resetSeed}>
            Solo resetear borrador
          </Button>
        </div>
        {message && (
          <p className="text-sm text-[var(--accent)]" role="status">
            {message}
          </p>
        )}
      </Surface>

      {versions.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Aún no hay versiones en el navegador. Publica para crear la primera.
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
                  onClick={() => restoreAt(version.savedAt)}
                >
                  Restaurar
                </Button>
              </Surface>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
