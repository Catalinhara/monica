"use client";

import { useAdminStore } from "@/stores/admin-store";
import { Button } from "@/components/shared/Button";
import { THEMES, type ThemeId } from "@/lib/themes";
import { Field, TextInput, TextSelect } from "./fields";

export function ExperienceEditor() {
  const draft = useAdminStore((s) => s.draft)!;
  const updateMeta = useAdminStore((s) => s.updateMeta);
  const setTheme = useAdminStore((s) => s.setTheme);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <header>
        <h2 className="font-display text-3xl">Experiencia</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Metadatos globales. El player usa la versión publicada.
        </p>
      </header>

      <Field label="Título">
        <TextInput
          value={draft.title}
          onChange={(e) => updateMeta({ title: e.target.value })}
        />
      </Field>

      <Field label="Nombre destinataria">
        <TextInput
          value={draft.recipientName}
          onChange={(e) => updateMeta({ recipientName: e.target.value })}
        />
      </Field>

      <Field label="Tema">
        <TextSelect
          value={draft.theme.id}
          onChange={(e) => setTheme(e.target.value as ThemeId)}
        >
          {Object.values(THEMES).map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.name}
            </option>
          ))}
        </TextSelect>
      </Field>

      <div className="rounded-xl border border-[var(--border)] bg-black/20 px-4 py-3 text-sm text-[var(--muted)]">
        Estado: <span className="text-[var(--foreground)]">{draft.status ?? "draft"}</span>
        {" · "}
        Versión base: <span className="text-[var(--foreground)]">{draft.version ?? 1}</span>
        {" · "}
        Niveles: <span className="text-[var(--foreground)]">{draft.levels.length}</span>
      </div>

      <Button href="/play?preview=1" variant="secondary">
        Abrir preview del borrador
      </Button>
    </div>
  );
}
