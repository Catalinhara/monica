"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Field, TextArea, TextInput, TextSelect } from "./fields";

type Props = {
  /** When true, omit the page header (used inside the final level editor). */
  embedded?: boolean;
};

export function FinalEditor({ embedded = false }: Props) {
  const draft = useAdminStore((s) => s.draft)!;
  const updateFinalQuestion = useAdminStore((s) => s.updateFinalQuestion);
  const updateNoBehavior = useAdminStore((s) => s.updateNoBehavior);
  const updateCelebration = useAdminStore((s) => s.updateCelebration);
  const updateFinalReward = useAdminStore((s) => s.updateFinalReward);
  const no = draft.finalQuestion.noBehavior;

  return (
    <div
      className={`mx-auto flex w-full flex-col gap-6 ${
        embedded ? "max-w-3xl" : "max-w-2xl"
      }`}
    >
      {!embedded && (
        <header>
          <h2 className="font-display text-3xl">Pregunta final</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Texto, comportamiento del No, celebración y recompensa.
          </p>
        </header>
      )}

      <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
        <h3 className="font-display text-xl">La pregunta</h3>
        <p className="text-sm text-[var(--muted)]">
          Pantalla del Sí / No (botón No en movimiento).
        </p>

        <Field label="Pregunta">
          <TextInput
            value={draft.finalQuestion.prompt}
            onChange={(e) => updateFinalQuestion({ prompt: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label Sí">
            <TextInput
              value={draft.finalQuestion.yesLabel}
              onChange={(e) =>
                updateFinalQuestion({ yesLabel: e.target.value })
              }
            />
          </Field>
          <Field label="Label No">
            <TextInput
              value={draft.finalQuestion.noLabel}
              onChange={(e) => updateFinalQuestion({ noLabel: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Mensajes del No (uno por línea)">
          <TextArea
            className="min-h-64 font-[family-name:var(--font-body)] text-sm leading-relaxed"
            value={no.messages.join("\n")}
            onChange={(e) =>
              updateNoBehavior({
                messages: e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean),
              })
            }
            spellCheck
          />
          <p className="mt-1.5 text-xs text-[var(--muted)]">
            {no.messages.length} frases · al pulsar No rotan en bucle y no se
            acaban.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mensajes del No activos">
            <TextSelect
              value={no.enabled ? "true" : "false"}
              onChange={(e) =>
                updateNoBehavior({ enabled: e.target.value === "true" })
              }
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </TextSelect>
          </Field>
          <Field label="No se mueve">
            <TextSelect
              value={no.movementEnabled ? "true" : "false"}
              onChange={(e) =>
                updateNoBehavior({
                  movementEnabled: e.target.value === "true",
                })
              }
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </TextSelect>
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
        <h3 className="font-display text-xl">Celebración</h3>
        <p className="text-sm text-[var(--muted)]">
          Textos tras el Sí, confeti continuo y música de fondo.
        </p>

        <Field label="Eyebrow (p. ej. Celebración)">
          <TextInput
            value={draft.celebration.eyebrow ?? ""}
            onChange={(e) =>
              updateCelebration({ eyebrow: e.target.value || undefined })
            }
          />
        </Field>
        <Field label="Título (usa **palabra** para negrita)">
          <TextInput
            value={draft.celebration.message}
            onChange={(e) => updateCelebration({ message: e.target.value })}
          />
        </Field>
        <Field label="Subtítulo">
          <TextInput
            value={draft.celebration.secondaryMessage ?? ""}
            onChange={(e) =>
              updateCelebration({
                secondaryMessage: e.target.value || undefined,
              })
            }
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Logro — etiqueta">
            <TextInput
              value={draft.celebration.achievementLabel ?? ""}
              onChange={(e) =>
                updateCelebration({
                  achievementLabel: e.target.value || undefined,
                })
              }
              placeholder="NUEVO LOGRO"
            />
          </Field>
          <Field label="Logro — título">
            <TextInput
              value={draft.celebration.achievementTitle ?? ""}
              onChange={(e) =>
                updateCelebration({
                  achievementTitle: e.target.value || undefined,
                })
              }
              placeholder="NOVIA DESBLOQUEADA"
            />
          </Field>
        </div>
        <Field label="Música de fondo (ruta pública)">
          <TextInput
            value={draft.celebration.musicSrc ?? ""}
            onChange={(e) =>
              updateCelebration({ musicSrc: e.target.value || undefined })
            }
            placeholder="/audio/celebration.mp3"
          />
        </Field>
      </div>

      <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
        <h3 className="font-display text-xl">Recompensa</h3>
        <p className="text-sm text-[var(--muted)]">
          Pantalla del premio ganado (tras Descubrir recompensa).
        </p>
        <Field label="Título">
          <TextInput
            value={draft.finalReward?.title ?? ""}
            onChange={(e) => updateFinalReward({ title: e.target.value })}
          />
        </Field>
        <Field label="Cuerpo (si no hay premio elegido)">
          <TextArea
            className="min-h-24 font-[family-name:var(--font-body)]"
            value={draft.finalReward?.body ?? ""}
            onChange={(e) => updateFinalReward({ body: e.target.value })}
          />
        </Field>
        <Field label="CTA del botón (descubrir recompensa)">
          <TextInput
            value={draft.finalReward?.cta ?? ""}
            onChange={(e) =>
              updateFinalReward({ cta: e.target.value || undefined })
            }
            placeholder="Descubrir recompensa"
          />
        </Field>
        <Field label="Botón final (vuelve al mapa)">
          <TextInput
            value={draft.finalReward?.doneLabel ?? ""}
            onChange={(e) =>
              updateFinalReward({ doneLabel: e.target.value || undefined })
            }
            placeholder="Gracias por jugar mi amor"
          />
        </Field>
      </div>
    </div>
  );
}
