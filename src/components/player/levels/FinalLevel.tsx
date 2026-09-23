"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Experience, Level } from "@/types";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onAccept: () => void;
  onExit: () => void;
};

type Point = { x: number; y: number };

const NO_BTN = { w: 64, h: 40 };
const SAFE = 12;

export function FinalLevel({ experience, level, onAccept, onExit }: Props) {
  const question = experience.finalQuestion;
  const behavior = question.noBehavior;
  const play = usePrefsStore((s) => s.play);
  const reduceMotion = useReducedMotion();
  const [noAttempts, setNoAttempts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [noPos, setNoPos] = useState<Point>({ x: SAFE, y: SAFE });
  const playfieldRef = useRef<HTMLDivElement>(null);

  const scrambleNo = useCallback(() => {
    const area = playfieldRef.current;
    if (!area) return;

    const width = area.clientWidth;
    const height = area.clientHeight;
    const maxX = Math.max(SAFE, width - NO_BTN.w - SAFE);
    const maxY = Math.max(SAFE, height - NO_BTN.h - SAFE);

    let x = SAFE + Math.random() * Math.max(0, maxX - SAFE);
    let y = SAFE + Math.random() * Math.max(0, maxY - SAFE);

    // Keep clear of the centered «Sí» band.
    const midY = height / 2;
    if (Math.abs(y + NO_BTN.h / 2 - midY) < 64) {
      y =
        Math.random() > 0.5
          ? SAFE + Math.random() * Math.max(0, midY - 96 - SAFE)
          : Math.min(maxY, midY + 72 + Math.random() * Math.max(0, maxY - midY - 72));
    }

    setNoPos({
      x: Math.min(maxX, Math.max(SAFE, x)),
      y: Math.min(maxY, Math.max(SAFE, y)),
    });
  }, []);

  useEffect(() => {
    if (step < 2 || !behavior.movementEnabled) return;

    scrambleNo();
    if (reduceMotion) return;

    const tick = () => {
      scrambleNo();
      timer = window.setTimeout(tick, 1100 + Math.random() * 1200);
    };
    let timer = window.setTimeout(tick, 900);

    const onResize = () => scrambleNo();
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [step, behavior.movementEnabled, reduceMotion, scrambleNo]);

  function handleNo(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    play("tap");
    const nextAttempts = noAttempts + 1;
    setNoAttempts(nextAttempts);

    if (
      behavior.enabled &&
      behavior.messages.length > 0 &&
      nextAttempts >= behavior.startAfterAttempts
    ) {
      const cycleIndex =
        (nextAttempts - behavior.startAfterAttempts) % behavior.messages.length;
      setMessage(behavior.messages[cycleIndex] ?? null);
    }

    // Move after the tap so the click always counts.
    window.setTimeout(() => {
      if (behavior.movementEnabled) scrambleNo();
    }, 80);
  }

  return (
    <LevelShell
      experience={experience}
      level={level}
      onExit={onExit}
      hideProgress
      minimal={step >= 2}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        {step === 0 && (
          <>
            <div className="flex flex-col items-center gap-3">
              <p className="text-[0.7rem] font-medium tracking-[0.32em] text-[var(--accent)] uppercase">
                Enhorabuena!
              </p>
              <p className="font-display text-3xl leading-snug sm:text-4xl">
                Has llegado al último nivel.
              </p>
            </div>
            <Button
              onClick={() => {
                play("advance");
                setStep(1);
              }}
            >
              …
            </Button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="font-display text-3xl leading-snug sm:text-4xl">
            Y este quizás no tenga respuesta correcta…
            </p>
            <Button
              onClick={() => {
                play("advance");
                setStep(2);
              }}
            >
              …
            </Button>
          </>
        )}

        {step >= 2 && (
          <div
            ref={playfieldRef}
            className="relative flex min-h-[min(70vh,32rem)] w-full flex-1 flex-col items-center justify-center"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-3 z-10 flex min-h-12 items-center justify-center px-4"
              aria-live="polite"
            >
              {message ? (
                <p
                  className="max-w-[18rem] text-center text-sm leading-snug text-[var(--accent)]"
                  role="status"
                >
                  {message}
                </p>
              ) : null}
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display max-w-[16rem] text-4xl leading-snug sm:max-w-none sm:text-5xl"
            >
              {question.prompt}
            </motion.p>

            <Button
              size="lg"
              className="mt-10 h-16 w-[min(100%,17rem)] px-10 text-2xl shadow-[0_12px_40px_var(--glow)] sm:h-20 sm:w-[min(100%,20rem)] sm:text-3xl"
              onClick={() => {
                play("celebrate");
                onAccept();
              }}
            >
              {question.yesLabel}
            </Button>

            <motion.div
              className="absolute z-20 touch-manipulation"
              style={{ width: NO_BTN.w, height: NO_BTN.h }}
              animate={{ left: noPos.x, top: noPos.y }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 280, damping: 24 }
              }
            >
              <button
                type="button"
                onClick={handleNo}
                className="flex h-full w-full items-center justify-center rounded-full border border-white/35 bg-white/18 text-xs font-medium tracking-wide text-white shadow-[0_4px_16px_rgba(0,0,0,0.35)] backdrop-blur-md transition active:scale-95"
                aria-label={question.noLabel}
              >
                {question.noLabel}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </LevelShell>
  );
}
