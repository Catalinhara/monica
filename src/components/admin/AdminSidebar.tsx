"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Button } from "@/components/shared/Button";
import { getOrderedLevels } from "@/engine";

export function AdminSidebar() {
  const draft = useAdminStore((s) => s.draft)!;
  const selectedLevelId = useAdminStore((s) => s.selectedLevelId);
  const panel = useAdminStore((s) => s.panel);
  const selectLevel = useAdminStore((s) => s.selectLevel);
  const setPanel = useAdminStore((s) => s.setPanel);
  const addLevel = useAdminStore((s) => s.addLevel);
  const moveLevel = useAdminStore((s) => s.moveLevel);
  const duplicateLevel = useAdminStore((s) => s.duplicateLevel);
  const deleteLevel = useAdminStore((s) => s.deleteLevel);

  const levels = getOrderedLevels(draft);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--border)] bg-black/20">
      <div className="border-b border-[var(--border)] px-4 py-4">
        <p className="text-[0.65rem] tracking-[0.24em] text-[var(--muted)] uppercase">
          Admin Editor
        </p>
        <h1 className="font-display mt-1 text-xl leading-tight">{draft.title}</h1>
      </div>

      <nav className="flex flex-col gap-1 px-2 py-3">
        {(
          [
            ["experience", "Experiencia"],
            ["final", "Pregunta final"],
            ["assets", "Assets"],
            ["versions", "Versiones"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setPanel(id);
              selectLevel(null);
            }}
            className={`rounded-lg px-3 py-2 text-left text-sm transition ${
              panel === id && !selectedLevelId
                ? "bg-[var(--accent-soft)] text-[var(--foreground)]"
                : "text-[var(--muted)] hover:bg-white/5 hover:text-[var(--foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-2 flex items-center justify-between px-4 pb-2">
        <p className="text-[0.65rem] tracking-[0.2em] text-[var(--muted)] uppercase">
          Levels
        </p>
        <Button size="sm" variant="ghost" onClick={() => addLevel("story")}>
          + Add
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <ol className="flex flex-col gap-1">
          {levels.map((level, index) => {
            const active = selectedLevelId === level.id;
            return (
              <li key={level.id}>
                <div
                  className={`group flex items-center gap-1 rounded-lg ${
                    active ? "bg-[var(--accent-soft)]" : "hover:bg-white/5"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectLevel(level.id)}
                    className="min-w-0 flex-1 px-3 py-2.5 text-left"
                  >
                    <span className="block truncate text-sm font-medium">
                      {index}. {level.title}
                    </span>
                    <span className="block text-xs text-[var(--muted)]">
                      {level.type}
                      {level.active === false ? " · off" : ""}
                    </span>
                  </button>
                  <div className="mr-1 hidden flex-col group-hover:flex">
                    <button
                      type="button"
                      className="px-1 text-[10px] text-[var(--muted)]"
                      onClick={() => moveLevel(level.id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="px-1 text-[10px] text-[var(--muted)]"
                      onClick={() => moveLevel(level.id, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </div>
                {active && (
                  <div className="mb-2 flex gap-2 px-2 pt-1">
                    <button
                      type="button"
                      className="text-[11px] text-[var(--muted)] underline"
                      onClick={() => duplicateLevel(level.id)}
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className="text-[11px] text-red-300/80 underline"
                      onClick={() => deleteLevel(level.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
