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
import { normalizeDisplayText } from "@/lib/display-text";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

type Phase = "intro" | "analyzing" | "results";

const DEFAULT_STEPS = [
  "Recopilando sonrisas, miradas y mensajes…",
  "El experto virtual en relaciones interpersonales toma nota de todo…",
  "Cruzando humor, química, caos y complicidad…",
  "Preparando el informe confidencial…",
];

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
      name: c.name ?? "Dato",
      percent: c.percent ?? 90,
      description: c.description,
      icon: c.icon,
      attentionNote: c.attentionNote,
    };
  });

  return {
    title: "Análisis de la relación",
    analyzingLabel: "Analizando…",
    stats,
  };
}

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function needsAttention(percent: number, threshold: number): boolean {
  return percent < threshold;
}

export function CompatibilityLevel({
  experience,
  level,
  onComplete,
  onExit,
}: Props) {
  const data = useMemo(() => loadStats(level), [level]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(0);
  const [barWidths, setBarWidths] = useState<number[]>([]);

  const threshold = data.attentionThreshold ?? 90;
  const steps =
    data.analyzingSteps && data.analyzingSteps.length > 0
      ? data.analyzingSteps
      : DEFAULT_STEPS;

  useEffect(() => {
    if (phase !== "analyzing") return;
    setStepIndex(0);
    const timers: number[] = [];
    steps.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => setStepIndex(index), index * 1100),
      );
    });
    timers.push(
      window.setTimeout(() => {
        setPhase("results");
        setVisible(0);
        setBarWidths(data.stats.map(() => 0));
      }, steps.length * 1100 + 700),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [phase, steps, data.stats]);

  useEffect(() => {
    if (phase !== "results") return;
    if (visible >= data.stats.length) return;
    const reveal = window.setTimeout(() => {
      setVisible((v) => v + 1);
      setBarWidths((prev) => {
        const next = [...prev];
        const index = visible;
        next[index] = clampPercent(data.stats[index]?.percent ?? 0);
        return next;
      });
    }, visible === 0 ? 350 : 650);
    return () => window.clearTimeout(reveal);
  }, [phase, visible, data.stats]);

  const progress =
    phase === "intro"
      ? 8
      : phase === "analyzing"
        ? 20 + Math.round(((stepIndex + 1) / Math.max(steps.length, 1)) * 35)
        : Math.round((visible / Math.max(data.stats.length, 1)) * 100);

  const allRevealed = phase === "results" && visible >= data.stats.length;

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progress}
      onExit={onExit}
    >
      {phase === "intro" && (
        <div className="flex flex-1 flex-col justify-center gap-6 text-center">
          <p className="text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
            {data.title ?? "Laboratorio de compatibilidad"}
          </p>
          <h2 className="font-display text-3xl leading-snug sm:text-4xl">
            {normalizeDisplayText(
              data.introTitle ??
                "Ahora tenemos bastantes datos para hacer un análisis.",
            )}
          </h2>
          <p className="mx-auto max-w-md whitespace-pre-wrap text-base leading-relaxed text-[var(--muted)]">
            {normalizeDisplayText(
              data.introBody ??
                "Recuerdos, respuestas, risas y un poco de caos…\n\nEs el momento de que el experto virtual en relaciones interpersonales prepare su informe más importante.",
            )}
          </p>
          <div className="mt-auto pt-8">
            <Button className="w-full" onClick={() => setPhase("analyzing")}>
              {data.introCta ?? "Empezar el análisis"}
            </Button>
          </div>
        </div>
      )}

      {phase === "analyzing" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <p className="text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
            {data.analyzingTitle ?? "Informe en curso"}
          </p>
          <div
            className="relative flex h-24 w-24 items-center justify-center"
            aria-hidden
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/20" />
            <span className="absolute inset-2 animate-pulse rounded-full border border-[var(--accent)]/40" />
            <span className="font-display text-3xl text-[var(--accent)]">♥</span>
          </div>
          <p className="font-display max-w-sm text-2xl leading-snug text-[var(--accent)]">
            {normalizeDisplayText(
              data.analyzingLabel ??
                "El experto virtual toma en cuenta todos los aspectos…",
            )}
          </p>
          <p
            className="min-h-12 max-w-md whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]"
            aria-live="polite"
          >
            {normalizeDisplayText(
              `${steps[Math.min(stepIndex, steps.length - 1)]}\nEspera los resultados.`,
            )}
          </p>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-[var(--ease-out-expo)]"
              style={{
                width: `${((stepIndex + 1) / steps.length) * 100}%`,
                boxShadow: "0 0 12px var(--glow)",
              }}
            />
          </div>
        </div>
      )}

      {phase === "results" && (
        <div className="flex flex-1 flex-col">
          <div className="mb-6 text-center">
            <p className="text-xs tracking-[0.28em] text-[var(--muted)] uppercase">
              {data.resultsTitle ?? "Resultados del análisis"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {normalizeDisplayText(
                data.resultsSubtitle ??
                  "Informe confidencial · solo para vosotros dos",
              )}
            </p>
            <p
              className="mt-4 inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/15 px-5 py-2 text-sm font-medium tracking-wide text-emerald-300"
              role="status"
            >
              {data.verdictLabel ?? "Super compatibles"}
            </p>
          </div>

          <ul className="flex flex-col gap-5">
            {data.stats.slice(0, visible).map((stat, index) => {
              const percent = clampPercent(stat.percent);
              const attention = needsAttention(percent, threshold);
              return (
                <li
                  key={stat.name}
                  className="animate-[fade-rise_0.45s_var(--ease-out-expo)_both]"
                >
                  <div className="mb-1.5 flex items-end justify-between gap-3">
                    <span className="text-sm font-medium">{stat.name}</span>
                    <span
                      className={`font-mono text-sm ${
                        attention ? "text-amber-300" : "text-[var(--accent)]"
                      }`}
                    >
                      {percent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-[var(--ease-out-expo)] ${
                        attention ? "bg-amber-400/90" : "bg-[var(--accent)]"
                      }`}
                      style={{
                        width: `${barWidths[index] ?? 0}%`,
                        boxShadow: attention
                          ? "0 0 12px rgba(251, 191, 36, 0.45)"
                          : "0 0 12px var(--glow)",
                      }}
                    />
                  </div>
                  {attention ? (
                    <p className="mt-1.5 text-xs font-medium tracking-wide text-amber-200/90">
                      {stat.attentionNote ??
                        data.attentionLabel ??
                        "Se necesita más atención"}
                    </p>
                  ) : (
                    stat.description && (
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {stat.description}
                      </p>
                    )
                  )}
                </li>
              );
            })}
          </ul>

          {allRevealed && data.closingMessage && (
            <div className="mt-8 flex flex-col items-center gap-4 text-center">
              <p className="font-display text-xl leading-snug text-[var(--foreground)]">
                {normalizeDisplayText(data.closingMessage)}
              </p>
            </div>
          )}

          <div className="mt-auto pt-8">
            <Button
              className="w-full"
              disabled={!allRevealed}
              onClick={onComplete}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </LevelShell>
  );
}
