"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useExperienceSession } from "@/stores/experience-session";
import { ThemeScope } from "@/components/shared/ThemeScope";
import { JourneyMap } from "./JourneyMap";
import { LevelPlayer } from "./LevelPlayer";
import { CelebrationScreen } from "./CelebrationScreen";
import { JourneyComplete } from "./JourneyComplete";

export function ExperiencePlayer() {
  const boot = useExperienceSession((s) => s.boot);
  const hydrated = useExperienceSession((s) => s.hydrated);
  const phase = useExperienceSession((s) => s.phase);
  const experience = useExperienceSession((s) => s.experience);

  useEffect(() => {
    boot();
  }, [boot]);

  if (!hydrated || !experience) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--muted)]">
        Cargando experiencia…
      </div>
    );
  }

  return (
    <ThemeScope
      themeId={experience.theme.id}
      className="flex min-h-full flex-1 flex-col"
    >
      <AnimatePresence mode="wait">
        {phase === "map" && (
          <motion.div
            key="map"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <JourneyMap />
          </motion.div>
        )}
        {phase === "level" && (
          <motion.div
            key="level"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <LevelPlayer />
          </motion.div>
        )}
        {phase === "celebration" && (
          <motion.div
            key="celebration"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <CelebrationScreen />
          </motion.div>
        )}
        {phase === "complete" && (
          <motion.div
            key="complete"
            className="flex flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <JourneyComplete />
          </motion.div>
        )}
      </AnimatePresence>
    </ThemeScope>
  );
}
