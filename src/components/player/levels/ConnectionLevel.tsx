"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, Scene } from "@/types";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";
import { FitMedia } from "../FitMedia";
import { normalizeDisplayText } from "@/lib/display-text";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

type Beat = {
  id: string;
  text: string;
  eyebrow?: string;
  src?: string;
  alt?: string;
  cta?: string;
};

type BeatContent = {
  text?: string;
  eyebrow?: string;
  src?: string;
  alt?: string;
  cta?: string;
  presentation?: string;
};

function asBeat(scene: Scene): Beat {
  const c = (scene.content ?? {}) as BeatContent;
  return {
    id: scene.id,
    text: c.text ?? "…",
    eyebrow: c.eyebrow,
    src: c.src,
    alt: c.alt,
    cta: c.cta,
  };
}

function loadBeats(level: Level): Beat[] {
  return getLevelScenes(level).map(asBeat);
}

const CONNECTION_SUBTITLE =
  "Lo que no cabe en un porcentaje: algo que atraviesa las barreras mentales y físicas";

const LEGACY_SUBTITLES = new Set([
  "Lo que no cabe en un porcentaje",
  "Más despacio",
  "Lo que no se mide en porcentajes",
]);

function resolveConnectionSubtitle(level: Level): string {
  if (!level.subtitle || LEGACY_SUBTITLES.has(level.subtitle)) {
    return CONNECTION_SUBTITLE;
  }
  return level.subtitle;
}

/** Floating sparks near the bottom — no glow wash behind the text. */
function ConnectionAura({
  progress,
  reduceMotion,
}: {
  progress: number;
  reduceMotion: boolean | null;
}) {
  const closeness = Math.min(1, Math.max(0, progress));
  const sparks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        x: 10 + ((i * 9) % 80),
        y: 58 + ((i * 8) % 32),
        size: 1.5 + (i % 3),
        delay: i * 0.28,
        duration: 2.6 + (i % 3) * 0.5,
      })),
    [],
  );

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {sparks.map((spark) => (
        <motion.span
          key={spark.id}
          className="absolute rounded-full bg-[var(--foreground)]"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            width: spark.size,
            height: spark.size,
            boxShadow: `0 0 ${4 + closeness * 4}px rgba(212, 106, 134, ${0.55 + closeness * 0.3})`,
          }}
          animate={{
            opacity: [0, 0.85, 0],
            y: [6, -10, -22],
            scale: [0.5, 1.15, 0.35],
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            delay: spark.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export function ConnectionLevel({
  experience,
  level,
  onComplete,
  onExit,
}: Props) {
  const beats = useMemo(() => loadBeats(level), [level]);
  const displayLevel = useMemo(
    () => ({ ...level, subtitle: resolveConnectionSubtitle(level) }),
    [level],
  );
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const play = usePrefsStore((s) => s.play);
  const reduceMotion = useReducedMotion();

  const beat = beats[index];
  const isLast = index >= beats.length - 1;
  const progress = !started
    ? 5
    : Math.round(((index + 1) / Math.max(beats.length, 1)) * 100);
  const auraProgress = !started ? 0 : (index + 1) / Math.max(beats.length, 1);

  function goNext() {
    if (!isLast) {
      play("advance");
      setIndex((i) => i + 1);
      return;
    }
    play("success");
    onComplete();
  }

  function goPrev() {
    if (index <= 0) {
      setStarted(false);
      return;
    }
    setIndex((i) => i - 1);
  }

  return (
    <LevelShell
      experience={experience}
      level={displayLevel}
      progressPercent={progress}
      onExit={onExit}
      hideProgress={!started}
    >
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <ConnectionAura progress={auraProgress} reduceMotion={reduceMotion} />

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="intro"
              className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-2 text-center"
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[0.7rem] font-medium tracking-[0.32em] text-[var(--accent)] uppercase">
                Un momento más despacio
              </p>
              <p className="max-w-sm text-base leading-relaxed text-[var(--muted)]">
                Un intento de poner en palabras lo que sacas de mí…
              </p>
              <div className="mt-4 w-full max-w-sm">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    play("advance");
                    setStarted(true);
                  }}
                >
                  Quiero decírtelo
                </Button>
              </div>
            </motion.div>
          ) : (
            beat && (
              <motion.div
                key={beat.id}
                className="relative z-10 flex flex-1 flex-col justify-center py-4"
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: 22, filter: "blur(6px)" }
                }
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, y: -16, filter: "blur(4px)" }
                }
                transition={{ duration: reduceMotion ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="space-y-6 text-center">
                  <p className="text-[0.65rem] tracking-[0.28em] text-[var(--muted)] uppercase">
                    {beat.eyebrow ??
                      `${index + 1} · ${beats.length}`}
                  </p>

                  {beat.src && (
                    <FitMedia
                      src={beat.src}
                      alt={beat.alt ?? ""}
                      maxHeightClass="max-h-[min(42vh,20rem)]"
                    />
                  )}

                  <p
                    className={`font-display mx-auto max-w-md whitespace-pre-wrap leading-snug text-[var(--foreground)] ${
                      isLast
                        ? "text-3xl text-[var(--accent)] sm:text-4xl"
                        : "text-3xl sm:text-[2.15rem]"
                    }`}
                  >
                    {normalizeDisplayText(beat.text)}
                  </p>
                </div>

                <footer className="mt-auto flex items-center justify-between gap-3 pt-10">
                  <Button variant="secondary" onClick={goPrev}>
                    Atrás
                  </Button>
                  <Button onClick={goNext}>
                    {isLast ? beat.cta ?? "Continuar" : "Seguir"}
                  </Button>
                </footer>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </LevelShell>
  );
}

export function isConnectionLevel(level: Level): boolean {
  if (level.id === "level-5") return true;
  const first = level.content[0]?.content as BeatContent | undefined;
  return first?.presentation === "connection";
}
