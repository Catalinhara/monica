"use client";

import { useEffect, useMemo, useState } from "react";
import { getLevelScenes } from "@/engine";
import type { ChoiceLevelContent, Experience, Level } from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";
import { PrizeCard, resolvePrizeMotif } from "../PrizeCard";
import { normalizeDisplayText } from "@/lib/display-text";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: (meta?: {
    selectedOptionId?: string;
    selectedOptionLabel?: string;
  }) => void;
  onExit: () => void;
};

function loadChoice(level: Level): ChoiceLevelContent {
  const scenes = getLevelScenes(level);
  const bundle = scenes.find((s) => {
    const c = s.content as ChoiceLevelContent;
    return Array.isArray(c?.options);
  });
  if (bundle) return bundle.content as ChoiceLevelContent;

  return {
    prompt: "¿Qué hacemos primero?",
    subtitle: "Estamos casi al final, elige un premio",
    options: scenes.map((scene, i) => {
      const c = scene.content as {
        label?: string;
        text?: string;
        emoji?: string;
        motif?: string;
        reply?: string;
        id?: string;
        imageSrc?: string;
      };
      return {
        id: c.id ?? scene.id,
        label: c.label ?? c.text ?? `Opción ${i + 1}`,
        emoji: c.emoji,
        motif: c.motif as ChoiceLevelContent["options"][number]["motif"],
        imageSrc: c.imageSrc,
        reply: c.reply,
      };
    }),
  };
}

export function ChoiceLevel({ experience, level, onComplete, onExit }: Props) {
  const data = useMemo(() => loadChoice(level), [level]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.options.find((o) => o.id === selectedId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [level.id]);

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={selected ? 100 : 20}
      onExit={onExit}
    >
      <div className="flex flex-col pb-2">
        {data.body && (
          <p className="mb-6 whitespace-pre-wrap text-center text-sm leading-relaxed text-[var(--muted)]">
            {normalizeDisplayText(data.body)}
          </p>
        )}

        <h2 className="font-display text-center text-3xl leading-snug">
          {data.prompt}
        </h2>
        {data.subtitle && (
          <p className="mt-2 text-center text-sm text-[var(--muted)]">
            {normalizeDisplayText(data.subtitle)}
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3 [overflow-anchor:none]">
          {data.options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedId(option.id)}
              className="text-left [overflow-anchor:none]"
              aria-pressed={selectedId === option.id}
            >
              <PrizeCard
                label={option.label}
                motif={resolvePrizeMotif(option)}
                imageSrc={option.imageSrc}
                selected={selectedId === option.id}
              />
            </button>
          ))}
        </div>

        {selected && (
          <p className="mt-6 text-center text-sm text-[var(--accent)]">
            {selected.reply ?? "Buena elección."}
          </p>
        )}

        <div className="pt-8">
          <Button
            className="w-full"
            disabled={!selectedId || !selected}
            onClick={() =>
              onComplete({
                selectedOptionId: selected!.id,
                selectedOptionLabel: selected!.label,
              })
            }
          >
            Continuar
          </Button>
        </div>
      </div>
    </LevelShell>
  );
}
