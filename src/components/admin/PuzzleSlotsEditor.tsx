"use client";

import type { Asset, Scene, SortingLevelContent } from "@/types";
import { AssetPicker } from "./AssetPicker";
import { Field, TextArea, TextInput } from "./fields";
import { Button } from "@/components/shared/Button";

export const PUZZLE_SLOT_COUNT = 4;

const DEFAULT_PROMPTS = [
  "Primer recuerdo.\nToca dos piezas para intercambiarlas.",
  "Segundo recuerdo.\nVuelve a recomponer la foto.",
  "Tercer recuerdo.\nCasi ahí…",
  "Cuarto recuerdo.\nEl último del nivel.",
];

const DEFAULT_SUCCESS = [
  "Así se veía ese momento.",
  "Otro instante recuperado.",
  "Tres recuerdos y seguimos…",
  "Los cuatro recuerdos están juntos otra vez.",
];

export function createEmptyPuzzleScenes(): Scene[] {
  return Array.from({ length: PUZZLE_SLOT_COUNT }, (_, index) => ({
    id: `puzzle-${index + 1}`,
    type: "image" as const,
    content: {
      prompt: DEFAULT_PROMPTS[index],
      successMessage: DEFAULT_SUCCESS[index],
      src: "",
      alt: `Puzzle ${index + 1}`,
    },
  }));
}

function asContent(scene: Scene | undefined): SortingLevelContent {
  if (!scene?.content || typeof scene.content !== "object") return {};
  return scene.content as SortingLevelContent;
}

/** Normalize any sorting content into exactly PUZZLE_SLOT_COUNT image-puzzle scenes. */
export function ensurePuzzleScenes(scenes: Scene[]): Scene[] {
  const fromBundle = scenes.find((s) => {
    const c = asContent(s);
    return Array.isArray(c.puzzles) && c.puzzles.length > 0;
  });

  let sources: SortingLevelContent[] = [];

  if (fromBundle) {
    sources = (asContent(fromBundle).puzzles ?? []).map((p) => ({
      prompt: p.prompt,
      src: p.src,
      alt: p.alt,
      successMessage: p.successMessage,
    }));
  } else {
    sources = scenes
      .map((s) => asContent(s))
      .filter((c) => Boolean(c.src) || Boolean(c.prompt));
  }

  const empty = createEmptyPuzzleScenes();
  return empty.map((slot, index) => {
    const src = sources[index] ?? {};
    const base = asContent(slot);
    return {
      ...slot,
      content: {
        prompt: src.prompt || base.prompt,
        successMessage: src.successMessage || base.successMessage,
        src: src.src || "",
        alt: src.alt || `Puzzle ${index + 1}`,
      },
    };
  });
}

type Props = {
  experienceId: string;
  scenes: Scene[];
  onChange: (scenes: Scene[]) => void;
};

export function PuzzleSlotsEditor({ experienceId, scenes, onChange }: Props) {
  const slots = ensurePuzzleScenes(scenes);

  function patchSlot(index: number, patch: Partial<SortingLevelContent>) {
    const next = ensurePuzzleScenes(scenes).map((scene, i) => {
      if (i !== index) return scene;
      const current = asContent(scene);
      return {
        ...scene,
        type: "image" as const,
        content: {
          ...current,
          ...patch,
        },
      };
    });
    onChange(next);
  }

  function clearSlotImage(index: number) {
    patchSlot(index, { src: "", alt: `Puzzle ${index + 1}` });
  }

  function assignAsset(index: number, asset: Asset) {
    patchSlot(index, {
      src: asset.url,
      alt: asset.alt ?? asset.name ?? `Puzzle ${index + 1}`,
    });
  }

  const filled = slots.filter((s) => Boolean(asContent(s).src)).length;

  return (
    <section className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl">Puzzles 3×3</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Sube o elige <strong>{PUZZLE_SLOT_COUNT} fotos</strong>. Cada una se
            convierte en un puzzle. Fotos listas: {filled}/{PUZZLE_SLOT_COUNT}.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onChange(ensurePuzzleScenes(scenes))}
        >
          Resetear huecos
        </Button>
      </header>

      <div className="grid gap-6">
        {slots.map((scene, index) => {
          const content = asContent(scene);
          const hasSrc = Boolean(content.src);

          return (
            <div
              key={scene.id}
              className="space-y-3 rounded-xl border border-[var(--border)] bg-black/25 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  Puzzle {index + 1}
                  <span className="ml-2 text-xs text-[var(--muted)]">
                    {hasSrc ? "Foto asignada" : "Sin foto"}
                  </span>
                </p>
              </div>

              <AssetPicker
                experienceId={experienceId}
                valueUrl={hasSrc ? content.src : undefined}
                onSelect={(asset) => assignAsset(index, asset)}
                onClear={() => clearSlotImage(index)}
                label={`Foto del puzzle ${index + 1}`}
              />

              <Field label="Texto / instrucción">
                <TextArea
                  value={content.prompt ?? ""}
                  onChange={(e) => patchSlot(index, { prompt: e.target.value })}
                  className="min-h-20"
                  placeholder="Recompón este recuerdo…"
                />
              </Field>

              <Field label="Mensaje al completar">
                <TextInput
                  value={content.successMessage ?? ""}
                  onChange={(e) =>
                    patchSlot(index, { successMessage: e.target.value })
                  }
                  placeholder="Así se veía ese momento."
                />
              </Field>
            </div>
          );
        })}
      </div>
    </section>
  );
}
