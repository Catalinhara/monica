"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useExperienceSession } from "@/stores/experience-session";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";

function ConfettiBurst() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="absolute top-1/3 left-1/2 h-2 w-2 rounded-full"
          style={{
            background:
              i % 3 === 0
                ? "var(--accent)"
                : i % 3 === 1
                  ? "#f5d0d8"
                  : "#ffffff",
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 360,
            y: 120 + Math.random() * 220,
            scale: 0.4,
          }}
          transition={{ duration: 1.4 + Math.random() * 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function CelebrationScreen() {
  const experience = useExperienceSession((s) => s.experience)!;
  const finishCelebration = useExperienceSession((s) => s.finishCelebration);
  const openMap = useExperienceSession((s) => s.openMap);
  const [showReward, setShowReward] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    setBurstKey(1);
    if (
      experience.celebration.effects.includes("vibration") &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate?.([40, 60, 40]);
    }
  }, [experience.celebration.effects]);

  const reward = experience.finalReward;

  return (
    <main className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16">
      {burstKey > 0 && <ConfettiBurst />}

      {!showReward ? (
        <>
          <PageHeader
            align="center"
            eyebrow="Celebration"
            title={experience.celebration.message}
            description={experience.celebration.secondaryMessage}
          />
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-center text-2xl text-[var(--accent)]"
          >
            NEW ACHIEVEMENT
            <br />
            GIRLFRIEND UNLOCKED
          </motion.p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {reward ? (
              <Button onClick={() => setShowReward(true)}>
                {reward.cta ?? "Descubrir recompensa"}
              </Button>
            ) : (
              <Button onClick={finishCelebration}>Continuar</Button>
            )}
          </div>
        </>
      ) : (
        <>
          <PageHeader
            align="center"
            eyebrow="Recompensa"
            title={reward?.title ?? "Una última cosa"}
            description={reward?.body}
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" onClick={openMap}>
              Ver mapa
            </Button>
            <Button onClick={finishCelebration}>Cerrar viaje</Button>
          </div>
        </>
      )}
    </main>
  );
}
