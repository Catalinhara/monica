"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, MemoryItemContent } from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";
import { FitMedia } from "../FitMedia";
import { normalizeDisplayText } from "@/lib/display-text";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

function asMemory(content: unknown): MemoryItemContent {
  const c = (content ?? {}) as MemoryItemContent;
  return {
    title: c.title ?? c.text ?? "Recuerdo",
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
        {memories.map((memory) => {
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
                className={`relative flex min-h-32 flex-col overflow-hidden p-0 transition ${
                  isOpen
                    ? "justify-end border-[var(--accent)]/50"
                    : "justify-center"
                }`}
              >
                {isOpen && memory.src ? (
                  <>
                    <FitMedia
                      src={memory.src}
                      alt={memory.alt ?? memory.title}
                      fill
                      className="absolute inset-0 rounded-none bg-black/50 shadow-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                  </>
                ) : (
                  <div
                    className={`absolute inset-0 ${
                      isOpen ? "bg-[var(--accent-soft)]" : "bg-white/[0.03]"
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 p-4 ${
                    isOpen ? "" : "flex flex-1 items-center justify-center"
                  }`}
                >
                  {isOpen ? (
                    <span className="font-display block text-lg leading-tight text-white">
                      {memory.title}
                    </span>
                  ) : (
                    <span className="block text-center text-[0.7rem] tracking-[0.18em] text-white/55 uppercase">
                      Toca para abrir
                    </span>
                  )}
                </div>
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
            className="mt-6 space-y-4 text-center"
          >
            {active.src && (
              <FitMedia
                src={active.src}
                alt={active.alt ?? active.title}
                maxHeightClass="max-h-[min(60vh,28rem)]"
              />
            )}
            <p className="font-display whitespace-pre-wrap text-xl leading-snug">
              {normalizeDisplayText(
                active.description ?? active.text ?? active.title,
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-8">
        <Button className="w-full" disabled={!allRevealed} onClick={onComplete}>
          {allRevealed
            ? "Recuerdos desbloqueados, a por más y mejores"
            : "Explora los recuerdos"}
        </Button>
      </div>
    </LevelShell>
  );
}
