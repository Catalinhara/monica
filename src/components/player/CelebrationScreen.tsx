"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type {
  ChoiceLevelContent,
  ChoiceOption,
  Experience,
  LevelProgress,
} from "@/types";
import { useExperienceSession } from "@/stores/experience-session";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ParticleField } from "@/components/shared/ParticleField";
import { PrizeCard, resolvePrizeMotif } from "./PrizeCard";

function findChosenPrize(
  experience: Experience,
  progress: Record<string, LevelProgress>,
): ChoiceOption | null {
  const choiceLevel = experience.levels.find((l) => l.type === "choice");
  if (!choiceLevel) return null;

  const saved = progress[choiceLevel.id];
  const optionId = saved?.selectedOptionId;
  const scenes = getLevelScenes(choiceLevel);
  const bundle = scenes.find((s) => {
    const c = s.content as ChoiceLevelContent;
    return Array.isArray(c?.options);
  });
  const options =
    (bundle?.content as ChoiceLevelContent | undefined)?.options ?? [];

  if (optionId) {
    const match = options.find((o) => o.id === optionId);
    if (match) return match;
  }

  if (saved?.selectedOptionLabel) {
    return {
      id: optionId ?? "chosen",
      label: saved.selectedOptionLabel,
    };
  }

  return null;
}

export function CelebrationScreen() {
  const experience = useExperienceSession((s) => s.experience)!;
  const progress = useExperienceSession((s) => s.progress);
  const finishCelebration = useExperienceSession((s) => s.finishCelebration);
  const openMap = useExperienceSession((s) => s.openMap);
  const play = usePrefsStore((s) => s.play);
  const muted = usePrefsStore((s) => s.muted);
  const hydratePrefs = usePrefsStore((s) => s.hydrate);
  const [showReward, setShowReward] = useState(false);

  const celebration = experience.celebration;
  const reward = experience.finalReward;
  const musicSrc = celebration.musicSrc ?? "/audio/celebration.mp3";

  const chosen = useMemo(
    () => findChosenPrize(experience, progress),
    [experience, progress],
  );

  useEffect(() => {
    hydratePrefs();
    play("celebrate");
    if (
      celebration.effects.includes("vibration") &&
      typeof navigator !== "undefined" &&
      "vibrate" in navigator
    ) {
      navigator.vibrate?.([40, 60, 40]);
    }
  }, [celebration.effects, hydratePrefs, play]);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio(musicSrc);
    audio.loop = true;
    audio.volume = muted ? 0 : 0.45;
    audio.preload = "auto";
    void audio.play().catch(() => {
      // Autoplay can be blocked until a prior gesture (Sí already counts).
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [musicSrc, muted]);

  const achievementLabel = celebration.achievementLabel ?? "NUEVO LOGRO";
  const achievementTitle =
    celebration.achievementTitle ?? "NOVIA DESBLOQUEADA";

  return (
    <main
      className="relative mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16"
      aria-live="polite"
    >
      <ParticleField count={42} continuous className="z-0" />

      {!showReward ? (
        <div className="relative z-10 flex flex-col items-center gap-8">
          <PageHeader
            align="center"
            eyebrow={celebration.eyebrow ?? "Celebración"}
            title={celebration.message}
            description={celebration.secondaryMessage}
          />
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-display text-center text-2xl text-[var(--accent)]"
          >
            {achievementLabel}
            <br />
            {achievementTitle}
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
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-8">
          <PageHeader
            align="center"
            eyebrow="Recompensa"
            title={
              reward?.title ?? "No te olvides de tu recompensa"
            }
            description={
              reward?.body ??
              "Hay un premio esperándote..."
            }
          />

          {chosen && (
            <div className="w-full max-w-[14rem]">
              <PrizeCard
                label={chosen.label}
                motif={resolvePrizeMotif(chosen)}
                imageSrc={chosen.imageSrc}
                selected
                compact
                showLabel={false}
              />
            </div>
          )}

          <p className="max-w-sm text-center text-xs leading-relaxed text-[var(--muted)]">
            *Para más detalles consulta tu{" "}
            <strong className="font-semibold text-[var(--foreground)]">
              novio
            </strong>
            ...
          </p>

          <div className="w-full max-w-sm">
            <Button className="w-full" onClick={openMap}>
              {reward?.doneLabel ?? "Gracias por jugar mi amor"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
