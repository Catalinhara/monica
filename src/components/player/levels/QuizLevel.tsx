"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type { Experience, Level, QuizQuestionContent } from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";

type Props = {
  experience: Experience;
  level: Level;
  onComplete: () => void;
  onExit: () => void;
};

function asQuestion(content: unknown): QuizQuestionContent {
  const c = content as QuizQuestionContent;
  return {
    question: c.question ?? "¿…?",
    options: c.options ?? [],
    correctOptionId: c.correctOptionId,
    feedbackCorrect: c.feedbackCorrect,
    feedbackWrong: c.feedbackWrong,
    feedback: c.feedback,
  };
}

export function QuizLevel({ experience, level, onComplete, onExit }: Props) {
  const questions = getLevelScenes(level).map((scene) => ({
    id: scene.id,
    ...asQuestion(scene.content),
  }));

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = questions[index];
  const progress = questions.length
    ? Math.round(((index + (selectedId ? 1 : 0)) / questions.length) * 100)
    : 100;

  function answer(optionId: string) {
    if (!current || selectedId) return;
    setSelectedId(optionId);
    const correct =
      !current.correctOptionId || optionId === current.correctOptionId;
    setFeedback(
      correct
        ? current.feedbackCorrect ?? current.feedback ?? "Buena respuesta."
        : current.feedbackWrong ?? current.feedback ?? "Casi… pero seguimos.",
    );
  }

  function continueQuiz() {
    if (index >= questions.length - 1) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
    setSelectedId(null);
    setFeedback(null);
  }

  if (!current) {
    return null;
  }

  return (
    <LevelShell
      experience={experience}
      level={level}
      progressPercent={Math.min(progress, 100)}
      onExit={onExit}
    >
      <p className="mb-2 text-xs tracking-[0.2em] text-[var(--muted)] uppercase">
        Pregunta {index + 1} / {questions.length}
      </p>
      <h2 className="font-display mb-8 text-2xl leading-snug sm:text-3xl">
        {current.question}
      </h2>

      <div className="flex flex-col gap-3">
        {current.options.map((option) => {
          const selected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={!!selectedId}
              onClick={() => answer(option.id)}
              className="text-left disabled:cursor-default"
            >
              <Surface
                interactive={!selectedId}
                className={`px-4 py-4 ${
                  selected ? "border-[var(--accent)]/60 bg-[var(--accent-soft)]" : ""
                }`}
              >
                {option.label}
              </Surface>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-[var(--accent)]"
          >
            {feedback}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-auto pt-8">
        <Button className="w-full" disabled={!selectedId} onClick={continueQuiz}>
          {index >= questions.length - 1 ? "Ver resultado" : "Siguiente"}
        </Button>
      </div>
    </LevelShell>
  );
}
