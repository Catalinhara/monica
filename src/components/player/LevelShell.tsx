"use client";

import type { ReactNode } from "react";
import {
  getLevelIndex,
  getOrderedLevels,
} from "@/engine";
import type { Level } from "@/types";
import type { Experience } from "@/types";
import { Button } from "@/components/shared/Button";

type Props = {
  experience: Experience;
  level: Level;
  progressPercent?: number;
  onExit: () => void;
  children: ReactNode;
  hideProgress?: boolean;
  minimal?: boolean;
};

export function LevelShell({
  experience,
  level,
  progressPercent = 0,
  onExit,
  children,
  hideProgress = false,
  minimal = false,
}: Props) {
  const levelNumber = getLevelIndex(experience, level.id);
  const totalLevels = getOrderedLevels(experience).length;

  return (
    <main className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col px-6 py-6">
      {!minimal && (
        <header className="mb-4 flex shrink-0 items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.28em] uppercase text-[var(--muted)]">
              Nivel {levelNumber + 1} / {totalLevels}
            </p>
            <h1 className="font-display mt-1 text-3xl leading-tight">{level.title}</h1>
            {level.subtitle && (
              <p className="mt-1 text-sm text-[var(--muted)]">{level.subtitle}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            Mapa
          </Button>
        </header>
      )}

      {!hideProgress && !minimal && (
        <div
          className="mb-4 h-1 shrink-0 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso del nivel ${level.title}`}
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
            style={{
              width: `${progressPercent}%`,
              boxShadow: "0 0 12px var(--glow)",
            }}
          />
        </div>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </main>
  );
}
