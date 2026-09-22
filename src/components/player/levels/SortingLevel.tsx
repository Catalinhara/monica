"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, PuzzleItemContent, SortingLevelContent } from "@/types";
import { Button } from "@/components/shared/Button";
import { LevelShell } from "../LevelShell";
import { FitMedia } from "../FitMedia";
import { normalizeDisplayText } from "@/lib/display-text";

const GRID = 3;
const TARGET_PUZZLES = 4;

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

type PuzzleSpec = {
  id: string;
  prompt: string;
  src: string;
  alt: string;
  successMessage: string;
};

function loadPuzzles(level: Level): PuzzleSpec[] {
  const scenes = getLevelScenes(level);
  const defaults = {
    prompt: "Recompón este recuerdo.",
    successMessage: "Así era ese momento.",
  };

  const bundle = scenes.find((s) => {
    const c = s.content as SortingLevelContent;
    return Array.isArray(c?.puzzles) && c.puzzles.length > 0;
  });

  if (bundle) {
    const c = bundle.content as SortingLevelContent;
    return (c.puzzles ?? [])
      .filter((p): p is PuzzleItemContent => Boolean(p?.src))
      .slice(0, TARGET_PUZZLES)
      .map((p, index) => ({
        id: `puzzle-${index}`,
        prompt: p.prompt ?? c.prompt ?? defaults.prompt,
        src: p.src,
        alt: p.alt ?? `Puzzle ${index + 1}`,
        successMessage: p.successMessage ?? defaults.successMessage,
      }));
  }

  return scenes
    .map((scene, index) => {
      const c = scene.content as SortingLevelContent;
      if (!c?.src || !String(c.src).trim()) return null;
      return {
        id: scene.id ?? `puzzle-${index}`,
        prompt: c.prompt ?? defaults.prompt,
        src: c.src,
        alt: c.alt ?? `Puzzle ${index + 1}`,
        successMessage: c.successMessage ?? defaults.successMessage,
      };
    })
    .filter((p): p is PuzzleSpec => p !== null)
    .slice(0, TARGET_PUZZLES);
}

function shuffleBoard(): number[] {
  const solved = Array.from({ length: GRID * GRID }, (_, i) => i);
  let board = [...solved];

  for (let attempt = 0; attempt < 40; attempt += 1) {
    board = [...solved];
    for (let i = board.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [board[i], board[j]] = [board[j], board[i]];
    }
    if (!board.every((piece, index) => piece === index)) return board;
  }

  [board[0], board[1]] = [board[1], board[0]];
  return board;
}

function tileBackgroundPosition(piece: number): string {
  const col = piece % GRID;
  const row = Math.floor(piece / GRID);
  const step = 100 / (GRID - 1);
  return `${col * step}% ${row * step}%`;
}

function SinglePuzzle({
  puzzle,
  index,
  total,
  onSolved,
  onSolvedChange,
}: {
  puzzle: PuzzleSpec;
  index: number;
  total: number;
  onSolved: () => void;
  onSolvedChange?: (solved: boolean) => void;
}) {
  const [board, setBoard] = useState(shuffleBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    setBoard(shuffleBoard());
    setSelected(null);
    setSolved(false);
    setMoves(0);
    onSolvedChange?.(false);
    // Reset only when the puzzle image changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid reset loops
  }, [puzzle.id, puzzle.src]);

  const handleTile = useCallback(
    (slot: number) => {
      if (solved) return;

      if (selected === null) {
        setSelected(slot);
        return;
      }

      if (selected === slot) {
        setSelected(null);
        return;
      }

      const from = selected;
      setSelected(null);
      setMoves((m) => m + 1);

      setBoard((prev) => {
        const next = [...prev];
        [next[from], next[slot]] = [next[slot], next[from]];
        return next;
      });
    },
    [selected, solved],
  );

  useEffect(() => {
    if (solved) return;
    const done = board.every((piece, i) => piece === i);
    if (!done) return;
    setSolved(true);
    onSolvedChange?.(true);
  }, [board, solved, onSolvedChange]);

  function reshuffle() {
    setBoard(shuffleBoard());
    setSelected(null);
    setSolved(false);
    onSolvedChange?.(false);
    setMoves(0);
  }

  return (
    <>
      <p className="mb-5 text-center font-display text-2xl leading-snug text-[var(--foreground)]">
        {normalizeDisplayText(puzzle.prompt)}
      </p>

      {solved ? (
        <p className="mb-5 text-center text-sm text-[var(--muted)]">
          ¡Completado!
          {moves > 0 ? ` · ${moves} movimientos` : null}
        </p>
      ) : moves > 0 ? (
        <p className="mb-5 text-center text-sm text-[var(--muted)]">
          {moves} movimientos
        </p>
      ) : null}

      {solved ? (
        <div className="space-y-4">
          <FitMedia
            src={puzzle.src}
            alt={puzzle.alt}
            maxHeightClass="max-h-[min(70vh,28rem)]"
          />
          <p className="font-display text-center text-xl leading-snug text-[var(--accent)]">
            {normalizeDisplayText(puzzle.successMessage)}
          </p>
        </div>
      ) : (
        <div
          className="mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/40 shadow-[var(--shadow-soft)]"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, 1fr)`,
            gap: "2px",
          }}
          role="grid"
          aria-label={`Puzzle ${index + 1} de ${total}, 3 por 3`}
        >
          {board.map((piece, slot) => {
            const isSelected = selected === slot;
            return (
              <button
                key={`${puzzle.id}-${slot}-${piece}`}
                type="button"
                role="gridcell"
                aria-label={`Pieza ${piece + 1}${isSelected ? ", seleccionada" : ""}`}
                aria-pressed={isSelected}
                onClick={() => handleTile(slot)}
                className={`relative aspect-square overflow-hidden transition ${
                  isSelected
                    ? "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--background)]"
                    : "hover:brightness-110"
                }`}
                style={{
                  backgroundImage: `url(${puzzle.src})`,
                  backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
                  backgroundPosition: tileBackgroundPosition(piece),
                  backgroundRepeat: "no-repeat",
                }}
              />
            );
          })}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        {solved ? (
          <Button className="w-full" onClick={onSolved}>
            {index >= total - 1 ? "Continuar" : "Siguiente puzzle"}
          </Button>
        ) : (
          <Button variant="secondary" className="w-full" onClick={reshuffle}>
            Mezclar de nuevo
          </Button>
        )}
      </div>
    </>
  );
}

export function SortingLevel({ experience, level, onComplete, onExit }: Props) {
  const puzzles = useMemo(() => loadPuzzles(level), [level]);
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [currentSolved, setCurrentSolved] = useState(false);

  const total = puzzles.length;
  const current = puzzles[puzzleIndex];
  const progressPercent =
    total === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            ((puzzleIndex + (currentSolved ? 1 : 0.3)) / total) * 100,
          ),
        );

  function advance() {
    if (puzzleIndex >= total - 1) {
      onComplete();
      return;
    }
    setCurrentSolved(false);
    setPuzzleIndex((i) => i + 1);
  }

  if (total === 0) {
    return (
      <LevelShell
        experience={experience}
        level={level}
        progressPercent={0}
        onExit={onExit}
      >
        <p className="font-display text-center text-2xl">
          Aún no hay puzzles configurados.
        </p>
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          En el editor, añade 3 escenas con foto (campo{" "}
          <code className="text-[var(--accent)]">src</code> en cada una).
        </p>
        <div className="mt-auto pt-8">
          <Button variant="secondary" className="w-full" onClick={onExit}>
            Volver al mapa
          </Button>
        </div>
      </LevelShell>
    );
  }

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={progressPercent}
      onExit={onExit}
    >
      <SinglePuzzle
        key={current.id}
        puzzle={current}
        index={puzzleIndex}
        total={total}
        onSolved={advance}
        onSolvedChange={setCurrentSolved}
      />
    </LevelShell>
  );
}
