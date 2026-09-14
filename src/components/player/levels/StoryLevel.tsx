"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  getSceneCursor,
  getSceneProgressPercent,
  isLevelCompletable,
} from "@/engine";
import type { Experience, Level } from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";
import { SceneView } from "../SceneView";

type Props = {
  experience: Experience;
  level: Level;
  sceneIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onExit: () => void;
};

export function StoryLevel({
  experience,
  level,
  sceneIndex,
  onNext,
  onPrev,
  onComplete,
  onExit,
}: Props) {
  const cursor = getSceneCursor(level, sceneIndex);
  const scenePercent = getSceneProgressPercent(level, sceneIndex);
  const canFinish = isLevelCompletable(level, sceneIndex);

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={scenePercent}
      onExit={onExit}
    >
      <div className="flex flex-1 flex-col justify-center py-6">
        <AnimatePresence mode="wait">
          {cursor.scene && (
            <motion.div
              key={cursor.scene.id}
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <SceneView scene={cursor.scene} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={onPrev} disabled={cursor.isFirst}>
          Atrás
        </Button>
        {cursor.isLast && canFinish ? (
          <Button onClick={onComplete}>Continuar</Button>
        ) : (
          <Button onClick={onNext}>Continuar</Button>
        )}
      </footer>
    </LevelShell>
  );
}
