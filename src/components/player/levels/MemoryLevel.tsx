"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, MemoryItemContent } from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

function asMemory(content: unknown): MemoryItemContent {
  const c = (content ?? {}) as MemoryItemContent;
  return {
    title: c.title ?? c.text ?? "Memoria",
    description: c.description,
    text: c.text,
    src: c.src,
    alt: c.alt,
  };
}

export function MemoryLevel({ experience, level, onComplete, onExit }: Props) {
  const memories = getLevelScenes(level).map((scene) => ({
    id: scene.id,
    ...asMemory(scene.content),
  }));
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);

  const progress = memories.length
    ? Math.round((revealed.size / memories.length) * 100)
    : 100;
  const allRevealed = revealed.size >= memories.length;

  function reveal(id: string) {
    setRevealed((prev) => new Set(prev).add(id));
    setActiveId(id);
  }

  const active = memories.find((m) => m.id === activeId);

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progress}
      onExit={onExit}
    >
      <p className="mb-6 text-center text-sm text-[var(--muted)]">
        Toca cada memoria para revelarla
      </p>

      <div className="grid grid-cols-2 gap-3">
        {memories.map((memory, index) => {
          const isOpen = revealed.has(memory.id);
          return (
            <button
              key={memory.id}
              type="button"
              onClick={() => reveal(memory.id)}
              className="text-left"
            >
              <Surface
                interactive
                className={`flex min-h-28 flex-col justify-end p-4 transition ${
                  isOpen ? "border-[var(--accent)]/50 bg-[var(--accent-soft)]" : ""
                }`}
              >
                <span className="font-mono text-[0.65rem] tracking-widest text-[var(--muted)] uppercase">
                  Memory {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display mt-1 text-lg leading-tight">
                  {isOpen ? memory.title : "•••"}
                </span>
              </Surface>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active && revealed.has(active.id) && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center"
          >
            <p className="font-display text-xl leading-snug">
              {active.description ?? active.text ?? active.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-8">
        <Button className="w-full" disabled={!allRevealed} onClick={onComplete}>
          {allRevealed ? "Primera memoria desbloqueada" : "Explora las memorias"}
        </Button>
      </div>
    </LevelShell>
  );
}
