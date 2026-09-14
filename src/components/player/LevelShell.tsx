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
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-8">
      {!minimal && (
        <header className="mb-6 flex items-start justify-between gap-4">
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
        <div className="mb-6 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-[var(--ease-out-expo)]"
            style={{
              width: `${progressPercent}%`,
              boxShadow: "0 0 12px var(--glow)",
            }}
          />
        </div>
      )}

      <div className="relative flex flex-1 flex-col">{children}</div>
    </main>
  );
}
