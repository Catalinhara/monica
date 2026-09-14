"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Experience, Level } from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onAccept: () => void;
  onExit: () => void;
};

export function FinalLevel({ experience, level, onAccept, onExit }: Props) {
  const question = experience.finalQuestion;
  const behavior = question.noBehavior;
  const [noAttempts, setNoAttempts] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState(0);

  function handleNo() {
    const nextAttempts = noAttempts + 1;
    setNoAttempts(nextAttempts);

    if (behavior.enabled && nextAttempts >= behavior.startAfterAttempts) {
      const msgIndex = Math.min(
        nextAttempts - behavior.startAfterAttempts,
        behavior.messages.length - 1,
      );
      setMessage(behavior.messages[msgIndex] ?? behavior.messages.at(-1) ?? null);

      if (behavior.movementEnabled) {
        const intensity = behavior.movementIntensity;
        const max = behavior.maxDistance;
        const angle = Math.random() * Math.PI * 2;
        const distance = max * (0.4 + intensity * Math.random());
        setOffset({
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        });
      }
    }
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
            <p className="font-display text-3xl leading-snug sm:text-4xl">
              Has llegado al último nivel.
            </p>
            <Button onClick={() => setStep(1)}>…</Button>
          </>
        )}

        {step === 1 && (
          <>
            <p className="font-display text-3xl leading-snug sm:text-4xl">
              Y este no tiene respuesta correcta.
            </p>
            <Button onClick={() => setStep(2)}>…</Button>
          </>
        )}

        {step >= 2 && (
          <>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl leading-snug sm:text-5xl"
            >
              {question.prompt}
            </motion.p>

            {message && (
              <p className="text-sm text-[var(--accent)]">{message}</p>
            )}

            <div className="relative mt-4 flex min-h-28 w-full max-w-sm items-center justify-center gap-4">
              <Button size="lg" onClick={onAccept}>
                {question.yesLabel}
              </Button>
              <motion.div
                animate={{ x: offset.x, y: offset.y }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
              >
                <Button variant="secondary" size="lg" onClick={handleNo}>
                  {question.noLabel}
                </Button>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </LevelShell>
  );
}
