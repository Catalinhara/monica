"use client";

import type { Level, QuizAboutHerConfig, QuizAboutHerItem } from "@/types";
import { Field, TextArea, TextInput } from "./fields";
import { Button } from "@/components/shared/Button";

const DEFAULT_CLOSING =
  "Seguiré disfrutando de descubrirte poco a poco, explorando cada rincón de ti, tanto por dentro como por fuera, aprendiendo cada uno de tus pequeños detalles, tus gustos y todo aquello que te hace ser tú…";

const TARGET_COUNT = 10;

function emptyItem(index: number): QuizAboutHerItem {
  return {
    id: `about-${index + 1}`,
    question: `Pregunta ${index + 1}…`,
    answer: `Respuesta ${index + 1}…`,
  };
}

function ensureItems(items: QuizAboutHerItem[] | undefined): QuizAboutHerItem[] {
  const list = [...(items ?? [])];
  while (list.length < TARGET_COUNT) {
    list.push(emptyItem(list.length));
  }
  return list.slice(0, TARGET_COUNT).map((item, index) => ({
    id: item.id || `about-${index + 1}`,
    question: item.question ?? "",
    answer: item.answer ?? "",
  }));
}

type Props = {
  level: Level;
  onChange: (aboutHer: QuizAboutHerConfig) => void;
};

export function QuizAboutHerEditor({ level, onChange }: Props) {
  const cfg = level.aboutHer;
  const items = ensureItems(cfg?.items);

  function patch(partial: Partial<QuizAboutHerConfig>) {
    onChange({
      title: cfg?.title,
      intro: cfg?.intro,
      closingNote: cfg?.closingNote ?? DEFAULT_CLOSING,
      items,
      ...partial,
    });
  }

  function patchItem(index: number, patchItem: Partial<QuizAboutHerItem>) {
    const next = items.map((item, i) =>
      i === index ? { ...item, ...patchItem } : item,
    );
    patch({ items: next });
  }

  return (
    <section className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
      <header>
        <h3 className="font-display text-xl">Sobre ella (post-resultados)</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Tras el examen, ella verá estas {TARGET_COUNT} preguntas y tus
          respuestas, y marcará ✓ o ✗ en cada una.
        </p>
      </header>

      <Field label="Título de la fase">
        <TextInput
          value={cfg?.title ?? ""}
          placeholder="Ahora te toca a ti… o casi"
          onChange={(e) =>
            patch({ title: e.target.value || undefined })
          }
        />
      </Field>

      <Field label="Intro (opcional)">
        <TextArea
          value={cfg?.intro ?? ""}
          placeholder="Breve texto encima de la lista…"
          onChange={(e) =>
            patch({ intro: e.target.value || undefined })
          }
          className="min-h-20"
        />
      </Field>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="space-y-3 rounded-xl border border-[var(--border)] bg-black/25 p-3"
          >
            <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
              Pareja {index + 1}
            </p>
            <Field label="Pregunta">
              <TextInput
                value={item.question}
                onChange={(e) =>
                  patchItem(index, { question: e.target.value })
                }
              />
            </Field>
            <Field label="Tu respuesta">
              <TextArea
                value={item.answer}
                onChange={(e) =>
                  patchItem(index, { answer: e.target.value })
                }
                className="min-h-24"
              />
            </Field>
          </div>
        ))}
      </div>

      <Field label="Nota final (junto a la puntuación)">
        <TextArea
          value={cfg?.closingNote ?? DEFAULT_CLOSING}
          onChange={(e) =>
            patch({ closingNote: e.target.value || DEFAULT_CLOSING })
          }
          className="min-h-28"
        />
      </Field>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() =>
          patch({
            items: Array.from({ length: TARGET_COUNT }, (_, i) => emptyItem(i)),
          })
        }
      >
        Resetear a 10 placeholders
      </Button>
    </section>
  );
}
