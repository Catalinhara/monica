"use client";

import { useMemo, useState } from "react";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, SortingItemContent, SortingLevelContent } from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

function loadItems(level: Level): { prompt: string; items: SortingItemContent[] } {
  const scenes = getLevelScenes(level);
  const bundle = scenes.find((s) => {
    const c = s.content as SortingLevelContent;
    return Array.isArray(c?.items);
  });

  if (bundle) {
    const c = bundle.content as SortingLevelContent;
    return {
      prompt: c.prompt ?? "Pon nuestra historia en orden.",
      items: c.items,
    };
  }

  const items = scenes.map((scene, index) => {
    const c = scene.content as SortingItemContent & { text?: string };
    return {
      id: c.id ?? scene.id,
      label: c.label ?? c.text ?? `Momento ${index + 1}`,
      correctOrder: c.correctOrder ?? index,
      description: c.description,
    };
  });

  return { prompt: "Pon nuestra historia en orden.", items };
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function SortingLevel({ experience, level, onComplete, onExit }: Props) {
  const { prompt, items } = useMemo(() => loadItems(level), [level]);
  const [order, setOrder] = useState(() => shuffle(items.map((i) => i.id)));
  const [checked, setChecked] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const byId = useMemo(
    () => Object.fromEntries(items.map((i) => [i.id, i])),
    [items],
  );

  const correct = items
    .slice()
    .sort((a, b) => a.correctOrder - b.correctOrder)
    .map((i) => i.id);

  const isCorrect = order.every((id, index) => id === correct[index]);
  const progress = showTimeline ? 100 : checked && isCorrect ? 80 : 40;

  function move(id: string, direction: -1 | 1) {
    if (checked && isCorrect) return;
    setChecked(false);
    setOrder((prev) => {
      const index = prev.indexOf(id);
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function check() {
    setChecked(true);
    if (order.every((id, index) => id === correct[index])) {
      setShowTimeline(true);
    }
  }

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progress}
      onExit={onExit}
    >
      <p className="font-display mb-6 text-center text-2xl">{prompt}</p>

      {!showTimeline ? (
        <ol className="flex flex-col gap-2">
          {order.map((id, index) => {
            const item = byId[id];
            const wrong = checked && id !== correct[index];
            return (
              <li key={id}>
                <Surface
                  className={`flex items-center gap-3 px-3 py-3 ${
                    wrong ? "border-red-400/40" : checked ? "border-emerald-400/40" : ""
                  }`}
                >
                  <span className="font-mono w-6 text-sm text-[var(--muted)]">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label="Subir"
                      className="h-8 w-8 rounded-full border border-[var(--border)] text-sm disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => move(id, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      className="h-8 w-8 rounded-full border border-[var(--border)] text-sm disabled:opacity-30"
                      disabled={index === order.length - 1}
                      onClick={() => move(id, 1)}
                    >
                      ↓
                    </button>
                  </div>
                </Surface>
              </li>
            );
          })}
        </ol>
      ) : (
        <ol className="flex flex-col items-center gap-2 py-4">
          {correct.map((id, index) => (
            <li key={id} className="flex flex-col items-center">
              <span className="font-display text-lg tracking-wide">
                {byId[id].label}
              </span>
              {index < correct.length - 1 && (
                <span className="my-1 text-[var(--muted)]">↓</span>
              )}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {!showTimeline ? (
          <Button onClick={check}>Comprobar orden</Button>
        ) : (
          <Button onClick={onComplete}>Continuar</Button>
        )}
        {checked && !isCorrect && (
          <p className="text-center text-sm text-[var(--muted)]">
            Casi… reordena y vuelve a comprobar.
          </p>
        )}
      </div>
    </LevelShell>
  );
}
