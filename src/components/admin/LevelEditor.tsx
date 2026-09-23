"use client";

import { useEffect, useState } from "react";
import type { LevelType, Scene } from "@/types";
import { useAdminStore } from "@/stores/admin-store";
import { Field, TextArea, TextInput, TextSelect } from "./fields";
import { AssetPicker } from "./AssetPicker";
import { Button } from "@/components/shared/Button";
import {
  ensurePuzzleScenes,
  PUZZLE_SLOT_COUNT,
  PuzzleSlotsEditor,
} from "./PuzzleSlotsEditor";
import { ChoiceEditor } from "./ChoiceEditor";
import { FinalEditor } from "./FinalEditor";
import { QuizAboutHerEditor } from "./QuizAboutHerEditor";

const LEVEL_TYPES: LevelType[] = [
  "story",
  "memory",
  "quiz",
  "sorting",
  "choice",
  "compatibility",
  "timeline",
  "gallery",
  "interactive",
  "final",
];

function sceneSrc(scene: Scene): string | undefined {
  if (!scene.content || typeof scene.content !== "object") return undefined;
  const src = (scene.content as { src?: unknown }).src;
  return typeof src === "string" && src.length > 0 ? src : undefined;
}

export function LevelEditor() {
  const draft = useAdminStore((s) => s.draft)!;
  const selectedLevelId = useAdminStore((s) => s.selectedLevelId);
  const updateLevel = useAdminStore((s) => s.updateLevel);
  const setScenesJson = useAdminStore((s) => s.setScenesJson);

  const level = draft.levels.find((l) => l.id === selectedLevelId);
  const [scenesText, setScenesText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [sceneIndex, setSceneIndex] = useState(0);

  useEffect(() => {
    if (!level) return;
    setScenesText(JSON.stringify(level.content, null, 2));
    setJsonError(null);
    setSceneIndex(0);
  }, [level]);

  // When opening a sorting level, normalize to exactly PUZZLE_SLOT_COUNT slots.
  useEffect(() => {
    if (!level || level.type !== "sorting") return;
    const needsNormalize =
      level.content.length !== PUZZLE_SLOT_COUNT ||
      level.content.some((scene) => scene.type !== "image");
    if (!needsNormalize) return;

    const normalized = ensurePuzzleScenes(level.content);
    updateLevel(level.id, { content: normalized });
    setScenesText(JSON.stringify(normalized, null, 2));
  }, [level, updateLevel]);

  if (!level) {
    return (
      <p className="text-[var(--muted)]">Selecciona un nivel en la barra lateral.</p>
    );
  }

  const scenes = level.content;
  const activeScene = scenes[sceneIndex];
  const isPuzzleLevel = level.type === "sorting";
  const isChoiceLevel = level.type === "choice";
  const isFinalLevel = level.type === "final";
  const isQuizLevel = level.type === "quiz";

  function applyScenes(nextScenes: Scene[]) {
    updateLevel(level!.id, { content: nextScenes });
    setScenesText(JSON.stringify(nextScenes, null, 2));
  }

  function patchActiveSceneContent(patch: Record<string, unknown>) {
    if (!activeScene) return;
    const current =
      activeScene.content && typeof activeScene.content === "object"
        ? (activeScene.content as Record<string, unknown>)
        : {};
    const nextScenes = scenes.map((scene, index) =>
      index === sceneIndex
        ? {
            ...scene,
            content: { ...current, ...patch },
            type:
              patch.src && scene.type === "text"
                ? level!.type === "memory"
                  ? scene.type
                  : "image"
                : scene.type,
          }
        : scene,
    );
    applyScenes(nextScenes as Scene[]);
  }

  function clearActiveSceneImage() {
    if (!activeScene) return;
    const current =
      activeScene.content && typeof activeScene.content === "object"
        ? { ...(activeScene.content as Record<string, unknown>) }
        : {};
    delete current.src;
    delete current.alt;
    const nextScenes = scenes.map((scene, index) =>
      index === sceneIndex ? { ...scene, content: current } : scene,
    );
    applyScenes(nextScenes);
  }

  function handleTypeChange(nextType: LevelType) {
    if (nextType === "sorting") {
      const normalized = ensurePuzzleScenes(level!.content);
      updateLevel(level!.id, { type: nextType, content: normalized });
      setScenesText(JSON.stringify(normalized, null, 2));
      return;
    }
    updateLevel(level!.id, { type: nextType });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">{level.title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {isPuzzleLevel
            ? `Sube ${PUZZLE_SLOT_COUNT} fotos para los puzzles 3×3. Luego publica para que Mónica las vea.`
            : isChoiceLevel
              ? "Texto del futuro, subtítulo del premio y tarjetas con imagen."
              : isFinalLevel
                ? "Metadatos del nivel, pregunta Sí/No, celebración, música y recompensa."
                : isQuizLevel
                  ? "Preguntas del quiz (JSON) y la fase «Sobre ella» con ✓ / ✗."
                  : "Metadatos, imagen por escena y JSON avanzado."}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título">
          <TextInput
            value={level.title}
            onChange={(e) => updateLevel(level.id, { title: e.target.value })}
          />
        </Field>
        <Field label="Subtítulo">
          <TextInput
            value={level.subtitle ?? ""}
            onChange={(e) =>
              updateLevel(level.id, { subtitle: e.target.value || undefined })
            }
          />
        </Field>
        <Field label="Tipo">
          <TextSelect
            value={level.type}
            onChange={(e) => handleTypeChange(e.target.value as LevelType)}
          >
            {LEVEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "sorting" ? "sorting (puzzles 3×3)" : type}
              </option>
            ))}
          </TextSelect>
        </Field>
        <Field label="Activo">
          <TextSelect
            value={level.active === false ? "false" : "true"}
            onChange={(e) =>
              updateLevel(level.id, { active: e.target.value === "true" })
            }
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </TextSelect>
        </Field>
      </div>

      {isPuzzleLevel ? (
        <PuzzleSlotsEditor
          experienceId={draft.id}
          scenes={scenes}
          onChange={applyScenes}
        />
      ) : isChoiceLevel ? (
        <ChoiceEditor scenes={scenes} onChange={applyScenes} />
      ) : isFinalLevel ? (
        <FinalEditor embedded />
      ) : isQuizLevel ? (
        <QuizAboutHerEditor
          level={level}
          onChange={(aboutHer) => updateLevel(level.id, { aboutHer })}
        />
      ) : (
        scenes.length > 0 && (
          <section className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl">Imagen de escena</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sceneIndex <= 0}
                  onClick={() => setSceneIndex((i) => Math.max(0, i - 1))}
                >
                  Anterior
                </Button>
                <span className="text-sm text-[var(--muted)]">
                  Escena {sceneIndex + 1} / {scenes.length}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={sceneIndex >= scenes.length - 1}
                  onClick={() =>
                    setSceneIndex((i) => Math.min(scenes.length - 1, i + 1))
                  }
                >
                  Siguiente
                </Button>
              </div>
            </div>

            <p className="text-sm text-[var(--muted)]">
              ID:{" "}
              <span className="font-mono text-[var(--foreground)]">
                {activeScene?.id}
              </span>
              {" · "}
              tipo: {activeScene?.type}
            </p>

            <AssetPicker
              experienceId={draft.id}
              valueUrl={activeScene ? sceneSrc(activeScene) : undefined}
              onSelect={(asset) =>
                patchActiveSceneContent({
                  src: asset.url,
                  alt: asset.alt ?? asset.name ?? "",
                })
              }
              onClear={clearActiveSceneImage}
              label="Foto para esta escena / memoria"
            />
          </section>
        )
      )}

      {!isFinalLevel && (
        <>
          <Field label="Escenas / content (JSON)">
            <TextArea
              value={scenesText}
              onChange={(e) => setScenesText(e.target.value)}
              onBlur={() => {
                const result = setScenesJson(level.id, scenesText);
                setJsonError(result.ok ? null : (result.error ?? "Error"));
              }}
              spellCheck={false}
              className="min-h-80"
            />
          </Field>
          {jsonError ? (
            <p className="text-sm text-red-300">{jsonError}</p>
          ) : (
            <p className="text-xs text-[var(--muted)]">
              Al salir del campo se valida y aplica el JSON al nivel.
            </p>
          )}
        </>
      )}
    </div>
  );
}
