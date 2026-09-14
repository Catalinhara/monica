"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { getLevelScenes } from "@/engine";
import type { Experience, InteractiveLevelContent, Level } from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

type Particle = { id: number; x: number; y: number; hue: number };

function loadContent(level: Level): InteractiveLevelContent {
  const scene = getLevelScenes(level)[0];
  const c = (scene?.content ?? {}) as InteractiveLevelContent;
  return {
    prompt: c.prompt ?? "Toca la pantalla y encuentra el ritmo.",
    afterPrompt: c.afterPrompt ?? "Creo que nosotros lo encontramos.",
    targetTaps: c.targetTaps ?? 8,
  };
}

export function InteractiveLevel({
  experience,
  level,
  onComplete,
  onExit,
}: Props) {
  const data = useMemo(() => loadContent(level), [level]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [taps, setTaps] = useState(0);
  const target = data.targetTaps ?? 8;
  const done = taps >= target;

  function handleTap(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setParticles((prev) => [
      ...prev.slice(-40),
      { id: Date.now() + Math.random(), x, y, hue: 330 + Math.random() * 40 },
    ]);
    setTaps((t) => t + 1);
  }

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={Math.min(100, Math.round((taps / target) * 100))}
      onExit={onExit}
    >
      <p className="font-display mb-4 text-center text-2xl">
        {done ? data.afterPrompt : data.prompt}
      </p>

      <div
        role="presentation"
        onClick={handleTap}
        className="relative mt-2 min-h-64 flex-1 cursor-pointer overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20"
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: `hsla(${p.hue}, 70%, 70%, 0.85)`,
              boxShadow: `0 0 18px hsla(${p.hue}, 70%, 60%, 0.6)`,
            }}
          />
        ))}
        {!done && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[var(--muted)]">
            Toca para crear el ritmo ({taps}/{target})
          </p>
        )}
      </div>

      <div className="mt-6">
        <Button className="w-full" disabled={!done} onClick={onComplete}>
          Continuar
        </Button>
      </div>
    </LevelShell>
  );
}
