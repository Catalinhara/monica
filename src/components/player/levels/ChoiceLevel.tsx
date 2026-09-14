"use client";

import { useMemo, useState } from "react";
import { getLevelScenes } from "@/engine";
import type { ChoiceLevelContent, Experience, Level } from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
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
    options: scenes.map((scene, i) => {
      const c = scene.content as { label?: string; text?: string; emoji?: string; reply?: string; id?: string };
      return {
        id: c.id ?? scene.id,
        label: c.label ?? c.text ?? `Opción ${i + 1}`,
        emoji: c.emoji,
        reply: c.reply,
      };
    }),
  };
}

export function ChoiceLevel({ experience, level, onComplete, onExit }: Props) {
  const data = useMemo(() => loadChoice(level), [level]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.options.find((o) => o.id === selectedId);

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={selected ? 100 : 20}
      onExit={onExit}
    >
      <h2 className="font-display mb-8 text-center text-3xl">{data.prompt}</h2>

      <div className="grid grid-cols-2 gap-3">
        {data.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedId(option.id)}
            className="text-left"
          >
            <Surface
              interactive
              className={`flex min-h-24 flex-col items-center justify-center gap-2 p-4 text-center ${
                selectedId === option.id
                  ? "border-[var(--accent)]/60 bg-[var(--accent-soft)]"
                  : ""
              }`}
            >
              {option.emoji && <span className="text-2xl">{option.emoji}</span>}
              <span className="text-sm font-medium">{option.label}</span>
            </Surface>
          </button>
        ))}
      </div>

      {selected && (
        <p className="mt-6 text-center text-[var(--accent)]">
          {selected.reply ?? "Buena elección."}
        </p>
      )}

      <div className="mt-auto pt-8">
        <Button className="w-full" disabled={!selectedId} onClick={onComplete}>
          Continuar
        </Button>
      </div>
    </LevelShell>
  );
}
