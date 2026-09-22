"use client";

import type {
  ChoiceLevelContent,
  ChoiceOption,
  PrizeMotif,
  Scene,
} from "@/types";
import { Field, TextArea, TextInput, TextSelect } from "./fields";
import { Button } from "@/components/shared/Button";

const MOTIFS: { value: PrizeMotif; label: string }[] = [
  { value: "dinner", label: "Cena" },
  { value: "trip", label: "Viaje" },
  { value: "dance", label: "Bailar" },
  { value: "escape", label: "Escapada" },
];

const DEFAULT_OPTIONS: ChoiceOption[] = [
  {
    id: "dinner",
    label: "Cena",
    motif: "dinner",
    imageSrc: "/prizes/cena.jpg",
    reply: "Buena elección.",
  },
  {
    id: "trip",
    label: "Viaje",
    motif: "trip",
    imageSrc: "/prizes/viaje.jpg",
    reply: "Sabía que elegirías eso.",
  },
  {
    id: "dance",
    label: "Bailar",
    motif: "dance",
    imageSrc: "/prizes/baile.jpg",
    reply: "El ritmo nos llama.",
  },
  {
    id: "escape",
    label: "Escapada",
    motif: "escape",
    imageSrc: "/prizes/escapada.jpg",
    reply: "Perfecto.",
  },
];

const MOTIF_DEFAULT_SRC: Record<PrizeMotif, string> = {
  dinner: "/prizes/cena.jpg",
  trip: "/prizes/viaje.jpg",
  dance: "/prizes/baile.jpg",
  escape: "/prizes/escapada.jpg",
};

function asChoice(content: unknown): ChoiceLevelContent {
  if (!content || typeof content !== "object") {
    return {
      prompt: "¿Qué hacemos primero?",
      subtitle: "Estamos casi al final, elige un premio",
      body: "",
      options: DEFAULT_OPTIONS,
    };
  }
  const c = content as ChoiceLevelContent;
  return {
    prompt: c.prompt ?? "¿Qué hacemos primero?",
    subtitle: c.subtitle ?? "Estamos casi al final, elige un premio",
    body: c.body ?? "",
    options:
      Array.isArray(c.options) && c.options.length > 0
        ? c.options.map((opt, index) => ({
            id: opt.id || DEFAULT_OPTIONS[index]?.id || `option-${index + 1}`,
            label: opt.label || `Opción ${index + 1}`,
            motif:
              opt.motif ||
              (DEFAULT_OPTIONS[index]?.motif as PrizeMotif | undefined),
            imageSrc:
              opt.imageSrc ||
              DEFAULT_OPTIONS[index]?.imageSrc ||
              (opt.motif
                ? MOTIF_DEFAULT_SRC[opt.motif as PrizeMotif]
                : undefined),
            reply: opt.reply ?? "",
            emoji: opt.emoji,
          }))
        : DEFAULT_OPTIONS,
  };
}

export function loadChoiceFromScenes(scenes: Scene[]): {
  sceneId: string;
  data: ChoiceLevelContent;
} {
  const bundle = scenes.find((s) => {
    const c = s.content as ChoiceLevelContent | undefined;
    return Array.isArray(c?.options) || s.type === "choice";
  });

  return {
    sceneId: bundle?.id ?? "future",
    data: asChoice(bundle?.content),
  };
}

export function choiceToScenes(
  sceneId: string,
  data: ChoiceLevelContent,
): Scene[] {
  return [
    {
      id: sceneId,
      type: "choice",
      content: {
        prompt: data.prompt,
        subtitle: data.subtitle || undefined,
        body: data.body || undefined,
        options: data.options.map((opt) => ({
          id: opt.id,
          label: opt.label,
          motif: opt.motif,
          imageSrc: opt.imageSrc || undefined,
          reply: opt.reply || undefined,
        })),
      },
    },
  ];
}

type Props = {
  scenes: Scene[];
  onChange: (scenes: Scene[]) => void;
};

export function ChoiceEditor({ scenes, onChange }: Props) {
  const { sceneId, data } = loadChoiceFromScenes(scenes);

  function patch(next: Partial<ChoiceLevelContent>) {
    onChange(choiceToScenes(sceneId, { ...data, ...next }));
  }

  function patchOption(index: number, patchOpt: Partial<ChoiceOption>) {
    const options = data.options.map((opt, i) =>
      i === index ? { ...opt, ...patchOpt } : opt,
    );
    patch({ options });
  }

  function addOption() {
    const n = data.options.length + 1;
    patch({
      options: [
        ...data.options,
        {
          id: `option-${n}`,
          label: `Premio ${n}`,
          motif: "dinner",
          reply: "",
        },
      ],
    });
  }

  function removeOption(index: number) {
    if (data.options.length <= 1) return;
    patch({ options: data.options.filter((_, i) => i !== index) });
  }

  return (
    <section className="space-y-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-black/20 p-4">
      <div>
        <h3 className="font-display text-xl">Premios del futuro</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Texto sobre el futuro, invitación al premio y las tarjetas con imagen
          (`/prizes/…`).
        </p>
      </div>

      <Field label="Título de la pregunta">
        <TextInput
          value={data.prompt}
          onChange={(e) => patch({ prompt: e.target.value })}
        />
      </Field>

      <Field label="Subtítulo (elige un premio)">
        <TextInput
          value={data.subtitle ?? ""}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </Field>

      <Field label="Texto sobre el futuro (encima de las opciones)">
        <TextArea
          value={data.body ?? ""}
          onChange={(e) => patch({ body: e.target.value })}
          className="min-h-32 font-[family-name:var(--font-body)] text-sm"
          spellCheck
        />
      </Field>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-medium tracking-wide text-[var(--muted)] uppercase">
            Opciones / premios
          </h4>
          <Button size="sm" variant="secondary" onClick={addOption}>
            Añadir premio
          </Button>
        </div>

        {data.options.map((option, index) => (
          <div
            key={`${option.id}-${index}`}
            className="space-y-3 rounded-xl border border-[var(--border)] bg-black/25 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs tracking-wide text-[var(--muted)] uppercase">
                Premio {index + 1}
              </p>
              <Button
                size="sm"
                variant="ghost"
                disabled={data.options.length <= 1}
                onClick={() => removeOption(index)}
              >
                Quitar
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ID">
                <TextInput
                  value={option.id}
                  onChange={(e) => patchOption(index, { id: e.target.value })}
                />
              </Field>
              <Field label="Motivo / imagen por defecto">
                <TextSelect
                  value={option.motif ?? "dinner"}
                  onChange={(e) => {
                    const motif = e.target.value as PrizeMotif;
                    patchOption(index, {
                      motif,
                      imageSrc: MOTIF_DEFAULT_SRC[motif],
                    });
                  }}
                >
                  {MOTIFS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </TextSelect>
              </Field>
              <Field label="Etiqueta">
                <TextInput
                  value={option.label}
                  onChange={(e) =>
                    patchOption(index, { label: e.target.value })
                  }
                />
              </Field>
              <Field label="Imagen (ruta pública)">
                <TextInput
                  value={option.imageSrc ?? ""}
                  onChange={(e) =>
                    patchOption(index, { imageSrc: e.target.value })
                  }
                  placeholder="/prizes/cena.jpg"
                />
              </Field>
              <Field label="Respuesta al elegir">
                <TextInput
                  value={option.reply ?? ""}
                  onChange={(e) =>
                    patchOption(index, { reply: e.target.value })
                  }
                />
              </Field>
            </div>
            {option.imageSrc ? (
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={option.imageSrc}
                  alt={option.label}
                  className="h-24 w-full object-cover"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
