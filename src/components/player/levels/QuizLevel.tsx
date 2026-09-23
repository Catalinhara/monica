"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevelScenes } from "@/engine";
import type {
  Experience,
  Level,
  QuizAboutHerConfig,
  QuizAboutHerItem,
  QuizQuestionContent,
} from "@/types";
import { Button } from "@/components/shared/Button";
import { Surface } from "@/components/shared/Surface";
import { LevelShell } from "../LevelShell";
import { normalizeDisplayText } from "@/lib/display-text";

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

type Mark = "yes" | "no";

const DEFAULT_ABOUT_TITLE = "Ahora te toca a ti… o casi";
const DEFAULT_CLOSING_NOTE =
  "Seguiré disfrutando de descubrirte poco a poco, explorando cada rincón de ti, tanto por dentro como por fuera, aprendiendo cada uno de tus pequeños detalles, tus gustos y todo aquello que te hace ser tú…";

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

function resolveAboutHer(level: Level): QuizAboutHerConfig | null {
  const cfg = level.aboutHer;
  if (!cfg?.items?.length) return null;
  return {
    title: cfg.title,
    intro: cfg.intro,
    items: cfg.items,
    closingNote: cfg.closingNote,
  };
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

  const aboutHer = useMemo(() => resolveAboutHer(level), [level]);

  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [phase, setPhase] = useState<"quiz" | "results" | "aboutHer">("quiz");
  const [marks, setMarks] = useState<Record<string, Mark>>({});

  const current = questions[index];
  const aboutItems = aboutHer?.items ?? [];
  const markedCount = aboutItems.filter((item) => marks[item.id]).length;
  const allMarked =
    aboutItems.length > 0 && markedCount === aboutItems.length;
  const yesCount = aboutItems.filter((item) => marks[item.id] === "yes").length;

  const progress =
    phase === "results" || phase === "aboutHer"
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

  function leaveResults() {
    if (aboutHer && aboutItems.length > 0) {
      setPhase("aboutHer");
      return;
    }
    onComplete();
  }

  function setMark(itemId: string, mark: Mark) {
    setMarks((prev) => ({ ...prev, [itemId]: mark }));
  }

  if (phase === "aboutHer" && aboutHer) {
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
              ¿Nos conocemos?
            </p>
            <h2 className="font-display mt-2 text-3xl leading-snug">
              {normalizeDisplayText(aboutHer.title ?? DEFAULT_ABOUT_TITLE)}
            </h2>
            {aboutHer.intro && (
              <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                {normalizeDisplayText(aboutHer.intro)}
              </p>
            )}
            <p className="mt-3 text-xs text-[var(--muted)]">
              Marca ✓ si acierto, o ✗ si no es así.
            </p>
          </header>

          <ol className="flex flex-col gap-4">
            {aboutItems.map((item, itemIndex) => (
              <AboutHerRow
                key={item.id}
                item={item}
                index={itemIndex}
                mark={marks[item.id]}
                onMark={setMark}
              />
            ))}
          </ol>

          {allMarked && (
            <div className="mt-8 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--accent)]/35 bg-[var(--accent-soft)] p-5 sm:flex-row sm:items-start sm:gap-6">
              <div className="shrink-0 text-center sm:text-left">
                <p className="text-xs tracking-[0.2em] text-[var(--muted)] uppercase">
                  Nota
                </p>
                <p className="font-display mt-1 text-5xl text-[var(--accent)]">
                  {yesCount}
                  <span className="text-2xl text-[var(--muted)]">
                    /{aboutItems.length}
                  </span>
                </p>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)] sm:pt-1">
                {normalizeDisplayText(
                  aboutHer.closingNote ?? DEFAULT_CLOSING_NOTE,
                )}
              </p>
            </div>
          )}

          <div className="mt-auto pt-8">
            <Button
              className="w-full"
              disabled={!allMarked}
              onClick={onComplete}
            >
              Continuar
            </Button>
            {!allMarked && (
              <p className="mt-2 text-center text-xs text-[var(--muted)]">
                {markedCount}/{aboutItems.length} marcadas
              </p>
            )}
          </div>
        </div>
      </LevelShell>
    );
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
            <Button className="w-full" onClick={leaveResults}>
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

function AboutHerRow({
  item,
  index,
  mark,
  onMark,
}: {
  item: QuizAboutHerItem;
  index: number;
  mark: Mark | undefined;
  onMark: (id: string, mark: Mark) => void;
}) {
  return (
    <li>
      <Surface className="space-y-3 p-4">
        <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
          Pregunta {index + 1}
        </p>
        <p className="font-display text-lg leading-snug">
          {normalizeDisplayText(item.question)}
        </p>
        <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--foreground)]">
          <span className="text-[var(--muted)]">Mi respuesta: </span>
          {normalizeDisplayText(item.answer)}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            aria-label="Acertado"
            aria-pressed={mark === "yes"}
            onClick={() => onMark(item.id, "yes")}
            className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-lg transition ${
              mark === "yes"
                ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                : "border-[var(--border)] bg-black/20 text-[var(--muted)] hover:border-emerald-400/40"
            }`}
          >
            ✓
          </button>
          <button
            type="button"
            aria-label="No es así"
            aria-pressed={mark === "no"}
            onClick={() => onMark(item.id, "no")}
            className={`flex h-11 flex-1 items-center justify-center rounded-xl border text-lg transition ${
              mark === "no"
                ? "border-rose-400/55 bg-rose-400/12 text-rose-300"
                : "border-[var(--border)] bg-black/20 text-[var(--muted)] hover:border-rose-400/40"
            }`}
          >
            ✗
          </button>
        </div>
      </Surface>
    </li>
  );
}
