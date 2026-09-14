"use client";

import { useEffect, useState } from "react";
import type { LevelType } from "@/types";
import { useAdminStore } from "@/stores/admin-store";
import { Field, TextArea, TextInput, TextSelect } from "./fields";

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

export function LevelEditor() {
  const draft = useAdminStore((s) => s.draft)!;
  const selectedLevelId = useAdminStore((s) => s.selectedLevelId);
  const updateLevel = useAdminStore((s) => s.updateLevel);
  const setScenesJson = useAdminStore((s) => s.setScenesJson);

  const level = draft.levels.find((l) => l.id === selectedLevelId);
  const [scenesText, setScenesText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!level) return;
    setScenesText(JSON.stringify(level.content, null, 2));
    setJsonError(null);
  }, [level]);

  if (!level) {
    return (
      <p className="text-[var(--muted)]">Selecciona un nivel en la barra lateral.</p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">{level.title}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Configura metadatos y el JSON de escenas / mecánica.
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
            onChange={(e) =>
              updateLevel(level.id, { type: e.target.value as LevelType })
            }
          >
            {LEVEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
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
    </div>
  );
}
