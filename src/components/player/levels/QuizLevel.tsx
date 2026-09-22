"use client";

import { useMemo, useState } from "react";
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

type Question = QuizQuestionContent & { id: string };

type AnswerRecord = {
  questionId: string;
  selectedOptionId: string;
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

function optionLabel(question: Question, optionId: string): string {
  return question.options.find((o) => o.id === optionId)?.label ?? "—";
}

export function QuizLevel({ experience, level, onComplete, onExit }: Props) {
  const questions = useMemo(
    () =>
      getLevelScenes(level).map((scene) => ({
        id: scene.id,
        ...asQuestion(scene.content),
      })),
    [level],
  );

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");

  const current = questions[index];
  const progress =
    phase === "results"
      ? 100
      : questions.length
        ? Math.round(((index + (selectedId ? 1 : 0)) / questions.length) * 100)
        : 100;

  function answer(optionId: string) {
    if (!current || selectedId) return;
    setSelectedId(optionId);
    setAnswers((prev) => {
      const without = prev.filter((a) => a.questionId !== current.id);
      return [...without, { questionId: current.id, selectedOptionId: optionId }];
    });

    const hasCorrect = Boolean(current.correctOptionId);
    const isCorrect = !hasCorrect || optionId === current.correctOptionId;
    setFeedback(
      isCorrect
        ? current.feedbackCorrect ?? current.feedback ?? "Buena respuesta."
        : current.feedbackWrong ?? current.feedback ?? "Casi… pero seguimos.",
    );
  }

  function continueQuiz() {
    if (index >= questions.length - 1) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
    setSelectedId(null);
    setFeedback(null);
  }

  if (phase === "results") {
    return (
      <LevelShell
        experience={experience}
        level={level}
        progressPercent={100}
        onExit={onExit}
      >
        <div className="flex flex-1 flex-col">
          <header className="mb-6 text-center">
            <p className="text-xs tracking-[0.24em] text-[var(--muted)] uppercase">
              Resultados
            </p>
            <h2 className="font-display mt-2 text-3xl leading-snug">
              Tu examen de “¿cuánto me conoces?”
            </h2>
            <p className="font-display mt-5 text-5xl text-[var(--accent)]">10</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              Un 10, porque eres una chica de 10.
            </p>
          </header>

          <ol className="flex flex-col gap-4">
            {questions.map((question, qIndex) => {
              const answer = answers.find((a) => a.questionId === question.id);
              const chosenId = answer?.selectedOptionId;
              const correctId = question.correctOptionId;
              const hasCorrect = Boolean(correctId);
              const isCorrect =
                hasCorrect && chosenId != null && chosenId === correctId;
              const isDifferent = hasCorrect && chosenId != null && !isCorrect;

              return (
                <li key={question.id}>
                  <Surface
                    className={`space-y-3 p-4 ${
                      isCorrect
                        ? "border-emerald-400/30"
                        : isDifferent
                          ? "border-[var(--border)]"
                          : ""
                    }`}
                  >
                    <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                      Pregunta {qIndex + 1}
                      {hasCorrect && (
                        <span
                          className={`ml-2 ${
                            isCorrect
                              ? "text-emerald-300/90"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {isCorrect ? "· Clavada" : "· Casi…"}
                        </span>
                      )}
                    </p>
                    <p className="font-display text-lg leading-snug">
                      {question.question}
                    </p>

                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-[var(--muted)]">Tu respuesta: </span>
                        <span className="text-[var(--foreground)]">
                          {chosenId
                            ? optionLabel(question, chosenId)
                            : "Sin respuesta"}
                        </span>
                      </p>
                      {hasCorrect && correctId && (
                        <p>
                          <span className="text-[var(--muted)]">
                            {isCorrect
                              ? "Respuesta correcta: "
                              : "Yo habría dicho: "}
                          </span>
                          <span className="text-[var(--accent)]">
                            {optionLabel(question, correctId)}
                          </span>
                        </p>
                      )}
                      {!hasCorrect && (
                        <p className="text-xs text-[var(--muted)]">
                          Aquí no había una sola respuesta buena… todas valían
                          contigo.
                        </p>
                      )}
                    </div>
                  </Surface>
                </li>
              );
            })}
          </ol>

          <div className="mt-auto pt-8">
            <Button className="w-full" onClick={onComplete}>
              Continuar
            </Button>
          </div>
        </div>
      </LevelShell>
    );
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
          const showCorrect =
            !!selectedId &&
            !!current.correctOptionId &&
            option.id === current.correctOptionId;
          const showWrong =
            selected &&
            !!current.correctOptionId &&
            option.id !== current.correctOptionId;

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
                  showCorrect
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : showWrong
                      ? "border-amber-300/45 bg-amber-300/10"
                      : selected
                        ? "border-[var(--accent)]/60 bg-[var(--accent-soft)]"
                        : ""
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
          {index >= questions.length - 1 ? "Ver resultados" : "Siguiente"}
        </Button>
      </div>
    </LevelShell>
  );
}
