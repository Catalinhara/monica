"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAdminStore } from "@/stores/admin-store";
import { Button } from "@/components/shared/Button";
import { AdminSidebar } from "./AdminSidebar";
import { ExperienceEditor } from "./ExperienceEditor";
import { LevelEditor } from "./LevelEditor";
import { FinalEditor } from "./FinalEditor";
import { VersionsPanel } from "./VersionsPanel";
import { AssetsPanel } from "./AssetsPanel";

export function AdminApp() {
  const hydrate = useAdminStore((s) => s.hydrate);
  const draft = useAdminStore((s) => s.draft);
  const panel = useAdminStore((s) => s.panel);
  const selectedLevelId = useAdminStore((s) => s.selectedLevelId);
  const dirty = useAdminStore((s) => s.dirty);
  const diskStatus = useAdminStore((s) => s.diskStatus);
  const message = useAdminStore((s) => s.message);
  const lastSavedAt = useAdminStore((s) => s.lastSavedAt);
  const saveDraft = useAdminStore((s) => s.saveDraft);
  const publish = useAdminStore((s) => s.publish);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      const state = useAdminStore.getState();
      if (state.dirty || state.diskStatus === "saving") {
        event.preventDefault();
        event.returnValue = "";
      }
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  if (!draft) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--muted)]">
        Cargando editor…
      </div>
    );
  }

  const statusLabel =
    diskStatus === "saving"
      ? "Guardando en monica.json…"
      : diskStatus === "error"
        ? "Error al guardar en disco"
        : dirty
          ? "Cambios sin guardar en disco"
          : lastSavedAt
            ? `Guardado en disco · ${new Date(lastSavedAt).toLocaleTimeString()}`
            : "Sin autoguardado · usa Guardar ahora";

  return (
    <div className="flex min-h-screen flex-1 flex-col lg:flex-row">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)]/80 px-4 py-3 backdrop-blur-md">
          <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
            <Link
              href="/"
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              ← Home
            </Link>
            <span
              className={`text-sm ${
                diskStatus === "error"
                  ? "text-amber-400"
                  : diskStatus === "saving"
                    ? "text-[var(--accent)]"
                    : dirty
                      ? "text-amber-300"
                      : "text-[var(--muted)]"
              }`}
            >
              {statusLabel}
            </span>
            {message && (
              <span className="truncate text-sm text-[var(--accent)]">
                {message}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href="/monica?preview=1" variant="ghost" size="sm">
              Preview
            </Button>
            <Button variant="secondary" size="sm" onClick={saveDraft}>
              Guardar ahora
            </Button>
            <Button size="sm" onClick={publish}>
              Publicar
            </Button>
          </div>
        </header>

        <div className="border-b border-[var(--border)] bg-black/20 px-4 py-2 text-xs text-[var(--muted)]">
          Los cambios se quedan en el navegador mientras editas. Pulsa{" "}
          <strong className="text-[var(--foreground)]">Guardar ahora</strong> o{" "}
          <strong className="text-[var(--foreground)]">Publicar</strong> para
          escribir{" "}
          <code className="text-[var(--accent)]">monica.json</code> en disco.
        </div>

        <div className="border-b border-[var(--border)] px-4 py-2 lg:hidden">
          <p className="mb-2 text-xs text-[var(--muted)]">
            El editor está pensado desktop-first. En móvil usa la lista compacta:
          </p>
          <AdminSidebar />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          {selectedLevelId || panel === "level" ? (
            <LevelEditor />
          ) : panel === "final" ? (
            <FinalEditor />
          ) : panel === "assets" ? (
            <AssetsPanel />
          ) : panel === "versions" ? (
            <VersionsPanel />
          ) : (
            <ExperienceEditor />
          )}
        </div>
      </div>
    </div>
  );
}
