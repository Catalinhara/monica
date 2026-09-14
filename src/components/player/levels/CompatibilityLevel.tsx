"use client";

import { useEffect, useMemo, useState } from "react";
import { getLevelScenes } from "@/engine";
import type {
  CompatibilityLevelContent,
  Experience,
  Level,
  StatisticContent,
} from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

function loadStats(level: Level): CompatibilityLevelContent {
  const scenes = getLevelScenes(level);
  const bundle = scenes.find((s) => {
    const c = s.content as CompatibilityLevelContent;
    return Array.isArray(c?.stats);
  });

  if (bundle) {
    return bundle.content as CompatibilityLevelContent;
  }

  const stats: StatisticContent[] = scenes.map((scene) => {
    const c = scene.content as StatisticContent;
    return {
      name: c.name ?? "Stat",
      percent: c.percent ?? 90,
      description: c.description,
      icon: c.icon,
    };
  });

  return {
    title: "RELATIONSHIP ANALYSIS",
    analyzingLabel: "Analyzing…",
    stats,
  };
}

export function CompatibilityLevel({
  experience,
  level,
  onComplete,
  onExit,
}: Props) {
  const data = useMemo(() => loadStats(level), [level]);
  const [analyzing, setAnalyzing] = useState(true);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const t = window.setTimeout(() => setAnalyzing(false), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (analyzing) return;
    if (visible >= data.stats.length) return;
    const t = window.setTimeout(() => setVisible((v) => v + 1), 450);
    return () => window.clearTimeout(t);
  }, [analyzing, visible, data.stats.length]);

  const progress = analyzing
    ? 15
    : Math.round((visible / Math.max(data.stats.length, 1)) * 100);

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progress}
      onExit={onExit}
    >
      <p className="mb-2 text-center text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
        {data.title ?? "RELATIONSHIP ANALYSIS"}
      </p>

      {analyzing ? (
        <p className="font-display animate-pulse py-16 text-center text-2xl text-[var(--accent)]">
          {data.analyzingLabel ?? "Analyzing…"}
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-5">
          {data.stats.slice(0, visible).map((stat) => (
            <li key={stat.name}>
              <div className="mb-1.5 flex items-end justify-between gap-3">
                <span className="text-sm font-medium">{stat.name}</span>
                <span className="font-mono text-sm text-[var(--accent)]">
                  {stat.percent}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-[var(--ease-out-expo)]"
                  style={{
                    width: `${stat.percent}%`,
                    boxShadow: "0 0 12px var(--glow)",
                  }}
                />
              </div>
              {stat.description && (
                <p className="mt-1 text-xs text-[var(--muted)]">{stat.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-8">
        <Button
          className="w-full"
          disabled={analyzing || visible < data.stats.length}
          onClick={onComplete}
        >
          Continuar
        </Button>
      </div>
    </LevelShell>
  );
}
