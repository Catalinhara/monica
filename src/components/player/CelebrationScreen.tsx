"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useExperienceSession } from "@/stores/experience-session";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ParticleField } from "@/components/shared/ParticleField";

export function CelebrationScreen() {
  const experience = useExperienceSession((s) => s.experience)!;
  const finishCelebration = useExperienceSession((s) => s.finishCelebration);
  const openMap = useExperienceSession((s) => s.openMap);
  const play = usePrefsStore((s) => s.play);
  const hydratePrefs = usePrefsStore((s) => s.hydrate);
  const [showReward, setShowReward] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    hydratePrefs();
    setBurstKey(1);
    play("celebrate");
    if (
      experience.celebration.effects.includes("vibration") &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate?.([40, 60, 40]);
    }
  }, [experience.celebration.effects, hydratePrefs, play]);

  const reward = experience.finalReward;

  return (
    <main
      className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16"
      aria-live="polite"
    >
      {burstKey > 0 && <ParticleField count={32} />}

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
              <Button
                onClick={() => {
                  play("success");
                  setShowReward(true);
                }}
              >
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
