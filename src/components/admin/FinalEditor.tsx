"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Field, TextArea, TextInput, TextSelect } from "./fields";

export function FinalEditor() {
  const draft = useAdminStore((s) => s.draft)!;
  const updateFinalQuestion = useAdminStore((s) => s.updateFinalQuestion);
  const updateNoBehavior = useAdminStore((s) => s.updateNoBehavior);
  const updateCelebration = useAdminStore((s) => s.updateCelebration);
  const updateFinalReward = useAdminStore((s) => s.updateFinalReward);
  const no = draft.finalQuestion.noBehavior;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Pregunta final</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Texto, comportamiento del No, celebración y recompensa.
        </p>
      </header>

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
            onChange={(e) => updateFinalQuestion({ yesLabel: e.target.value })}
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
          className="font-[family-name:var(--font-body)]"
          value={no.messages.join("\n")}
          onChange={(e) =>
            updateNoBehavior({
              messages: e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="No behavior enabled">
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
        <Field label="Movement enabled">
          <TextSelect
            value={no.movementEnabled ? "true" : "false"}
            onChange={(e) =>
              updateNoBehavior({ movementEnabled: e.target.value === "true" })
            }
          >
            <option value="true">Sí</option>
            <option value="false">No</option>
          </TextSelect>
        </Field>
        <Field label="Start after attempts">
          <TextInput
            type="number"
            min={0}
            value={no.startAfterAttempts}
            onChange={(e) =>
              updateNoBehavior({ startAfterAttempts: Number(e.target.value) || 0 })
            }
          />
        </Field>
        <Field label="Max distance">
          <TextInput
            type="number"
            min={0}
            value={no.maxDistance}
            onChange={(e) =>
              updateNoBehavior({ maxDistance: Number(e.target.value) || 0 })
            }
          />
        </Field>
      </div>

      <Field label="Celebración — mensaje">
        <TextInput
          value={draft.celebration.message}
          onChange={(e) => updateCelebration({ message: e.target.value })}
        />
      </Field>
      <Field label="Celebración — secundario">
        <TextInput
          value={draft.celebration.secondaryMessage ?? ""}
          onChange={(e) =>
            updateCelebration({ secondaryMessage: e.target.value || undefined })
          }
        />
      </Field>

      <Field label="Recompensa — título">
        <TextInput
          value={draft.finalReward?.title ?? ""}
          onChange={(e) => updateFinalReward({ title: e.target.value })}
        />
      </Field>
      <Field label="Recompensa — cuerpo">
        <TextArea
          className="min-h-24 font-[family-name:var(--font-body)]"
          value={draft.finalReward?.body ?? ""}
          onChange={(e) => updateFinalReward({ body: e.target.value })}
        />
      </Field>
    </div>
  );
}
