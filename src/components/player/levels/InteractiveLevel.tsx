"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getLevelScenes } from "@/engine";
import type {
  DanceRoundContent,
  Experience,
  InteractiveLevelContent,
  Level,
} from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";
import { normalizeDisplayText } from "@/lib/display-text";
import {
  getActiveRhythmLoop,
  playStepTap,
  RHYTHM_PATTERNS,
  startRhythmLoop,
  stopRhythmLoop,
  type DanceStyle,
} from "@/lib/sound";
import { usePrefsStore } from "@/stores/prefs-store";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

type Phase = "intro" | "dance" | "between" | "done";

const DEFAULT_DANCES: DanceRoundContent[] = [
  {
    style: "bachata",
    title: "Bachata",
    prompt: "Sigue los pasos: 1 · 2 · 3 · tap",
    afterPrompt: "Qué bien se siente este ritmo juntos…",
    targetSteps: 12,
    bpm: 108,
  },
  {
    style: "salsa",
    title: "Salsa",
    prompt: "Ahora salsa: 1 · 2 · 3 · … · 5 · 6 · 7",
    afterPrompt: "Creo que nosotros encontramos el mismo ritmo.",
    targetSteps: 16,
    bpm: 152,
  },
];

function loadContent(level: Level): InteractiveLevelContent {
  const scene = getLevelScenes(level)[0];
  const c = (scene?.content ?? {}) as InteractiveLevelContent;
  return {
    introTitle: c.introTitle,
    introBody: c.introBody,
    prompt: c.prompt,
    afterPrompt: c.afterPrompt,
    doneBody: c.doneBody,
    targetTaps: c.targetTaps,
    dances:
      Array.isArray(c.dances) && c.dances.length > 0 ? c.dances : DEFAULT_DANCES,
  };
}

function styleLabel(style: DanceStyle): string {
  return style === "bachata" ? "Bachata" : "Salsa";
}

export function InteractiveLevel({
  experience,
  level,
  onComplete,
  onExit,
}: Props) {
  const data = useMemo(() => loadContent(level), [level]);
  const dances = data.dances ?? DEFAULT_DANCES;
  const muted = usePrefsStore((s) => s.muted);
  const hydrate = usePrefsStore((s) => s.hydrate);
  const play = usePrefsStore((s) => s.play);

  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [hits, setHits] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "miss" | null>(null);

  const round = dances[roundIndex] ?? DEFAULT_DANCES[0];
  const style = (round.style ?? "bachata") as DanceStyle;
  const pattern = RHYTHM_PATTERNS[style];
  const target = round.targetSteps ?? (style === "bachata" ? 12 : 16);
  const roundDone = hits >= target;
  const isLastRound = roundIndex >= dances.length - 1;
  const bpm = round.bpm ?? pattern.bpm;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (phase !== "dance" || roundDone) {
      stopRhythmLoop();
      return;
    }

    const handle = startRhythmLoop(style, {
      muted,
      bpm,
      musicSrc: round.musicSrc,
      onBeat: (beat) => {
        setActiveStep(beat.step);
        if (beat.active) {
          setPulse(true);
          const pulseMs = Math.min(220, (60 / bpm) * 1000 * 0.45);
          window.setTimeout(() => setPulse(false), pulseMs);
        }
      },
    });

    return () => handle.stop();
  }, [phase, style, muted, bpm, roundDone, roundIndex, round.musicSrc]);

  useEffect(() => () => stopRhythmLoop(), []);

  function startRound(index: number) {
    setRoundIndex(index);
    setHits(0);
    setFeedback(null);
    setActiveStep(0);
    setPhase("dance");
    play("advance");
  }

  function registerTap() {
    if (phase !== "dance" || roundDone) return;

    const judgment = getActiveRhythmLoop()?.judgeTap() ?? "miss";

    if (judgment === "hit") {
      playStepTap(muted);
      setHits((h) => Math.min(target, h + 1));
      setFeedback("good");
    } else {
      setFeedback("miss");
    }
    window.setTimeout(() => setFeedback(null), 280);
  }

  function finishRound() {
    stopRhythmLoop();
    play("success");
    if (isLastRound) {
      setPhase("done");
      return;
    }
    setPhase("between");
  }

  const progress =
    phase === "intro"
      ? 5
      : phase === "done"
        ? 100
        : Math.round(
            ((roundIndex + Math.min(hits, target) / target) / dances.length) *
              100,
          );

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progress}
      onExit={() => {
        stopRhythmLoop();
        onExit();
      }}
    >
      {phase === "intro" && (
        <div className="flex min-h-[calc(100dvh-12rem)] flex-1 flex-col items-center gap-5 text-center">
          <p className="text-xs tracking-[0.18em] text-[var(--muted)] uppercase">
            Dos ritmos · dos almas · una unión
          </p>
          <p className="mx-auto max-w-md whitespace-pre-wrap text-base leading-relaxed text-[var(--muted)]">
            {normalizeDisplayText(
              data.introBody ??
                "Primero bachata, después salsa.\n\nEscucha el ritmo de fondo y toca cuando se encienda el paso. Como en la pista… juntos.",
            )}
          </p>
          <h2 className="font-display text-3xl leading-snug sm:text-4xl">
            {normalizeDisplayText(data.introTitle ?? "¿Bailamos?")}
          </h2>
          <div className="mt-2 w-full max-w-sm">
            <Button className="w-full" onClick={() => startRound(0)}>
              Empezar
            </Button>
          </div>
        </div>
      )}

      {phase === "dance" && (
        <div className="flex flex-1 flex-col">
          <div className="mb-4 text-center">
            <p className="text-xs tracking-[0.24em] text-[var(--accent)] uppercase">
              Parte {roundIndex + 1} / {dances.length} ·{" "}
              {round.title ?? styleLabel(style)}
            </p>
            <p className="font-display mt-2 text-2xl leading-snug">
              {normalizeDisplayText(
                roundDone
                  ? round.afterPrompt ?? "Qué bien se siente este ritmo…"
                  : round.prompt ??
                      data.prompt ??
                      "Toca al ritmo de los pasos.",
              )}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {roundDone
                ? "Ronda completada"
                : `Pasos a tiempo: ${hits} / ${target}`}
            </p>
          </div>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              registerTap();
            }}
            disabled={roundDone}
            className={`relative flex min-h-56 flex-1 flex-col items-center justify-center gap-6 overflow-hidden rounded-[var(--radius-lg)] border transition ${
              pulse
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border)] bg-black/25"
            } ${feedback === "good" ? "ring-2 ring-emerald-400/50" : ""} ${
              feedback === "miss" ? "ring-2 ring-amber-400/40" : ""
            }`}
            aria-label="Zona de baile: toca al ritmo"
          >
            <div
              className={`grid w-full max-w-sm gap-2 px-4 ${
                style === "bachata" ? "grid-cols-4" : "grid-cols-4"
              }`}
            >
              {pattern.labels.map((label, index) => {
                const isActive = activeStep === index && pulse;
                const isStep = pattern.activeSteps.includes(index);
                return (
                  <div
                    key={`${label}-${index}`}
                    aria-hidden={!isStep}
                    className={`pointer-events-none flex aspect-square flex-col items-center justify-center rounded-2xl border text-center transition duration-100 ${
                      isActive
                        ? "scale-105 border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_0_20px_var(--glow)]"
                        : isStep
                          ? "border-[var(--border)] bg-white/5 text-[var(--foreground)]"
                          : "border-[var(--border)] bg-transparent text-[var(--muted)] opacity-50"
                    }`}
                  >
                    <span
                      className={`font-display leading-none ${
                        isStep ? "text-xl" : "text-lg tracking-wider"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {!roundDone && (
              <p className="px-4 text-sm text-[var(--muted)]">
                {feedback === "good"
                  ? "¡Eso es!"
                  : feedback === "miss"
                    ? "Casi… espera el paso"
                    : "Toca aquí cuando el paso se encienda"}
              </p>
            )}
          </button>

          <div className="mt-6">
            {roundDone ? (
              <Button className="w-full" onClick={finishRound}>
                {isLastRound ? "Continuar" : "Siguiente baile…"}
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {phase === "between" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
            Cambio de ritmo
          </p>
          <h2 className="font-display text-3xl leading-snug">
            Cambio de ritmo, algo más animado…
          </h2>
          <div className="mt-4 w-full max-w-sm">
            <Button className="w-full" onClick={() => startRound(roundIndex + 1)}>
              Empezar
            </Button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <p className="text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
            Fin del baile
          </p>
          <h2 className="font-display text-3xl leading-snug text-[var(--accent)]">
            {normalizeDisplayText(
              data.afterPrompt ??
                dances.at(-1)?.afterPrompt ??
                "Creo que nosotros encontramos el mismo ritmo.",
            )}
          </h2>
          <p className="max-w-sm text-sm text-[var(--muted)]">
            {normalizeDisplayText(
              data.doneBody ?? "Seguiremos practicando en la vida real amor",
            )}
          </p>
          <div className="mt-4 w-full max-w-sm">
            <Button
              className="w-full"
              onClick={() => {
                stopRhythmLoop();
                onComplete();
              }}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}
    </LevelShell>
  );
}
