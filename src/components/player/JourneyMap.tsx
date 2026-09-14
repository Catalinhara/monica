"use client";

import {
  getJourneyProgressPercent,
  getOrderedLevels,
  getStatusLabel,
} from "@/engine";
import { useExperienceSession } from "@/stores/experience-session";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Surface } from "@/components/shared/Surface";
import { SoundToggle } from "@/components/shared/SoundToggle";

export function JourneyMap() {
  const experience = useExperienceSession((s) => s.experience)!;
  const progress = useExperienceSession((s) => s.progress);
  const enterLevel = useExperienceSession((s) => s.enterLevel);
  const resetJourney = useExperienceSession((s) => s.resetJourney);
  const play = usePrefsStore((s) => s.play);

  const levels = getOrderedLevels(experience);
  const percent = getJourneyProgressPercent(experience, progress);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-9 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex justify-end">
        <SoundToggle />
      </div>

      <PageHeader
        eyebrow={experience.title}
        title={`Hola, ${experience.recipientName}`}
        description={`Progreso del viaje: ${percent}%`}
      >
        <div
          className="mt-1 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del viaje"
        >
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none"
            style={{
              width: `${percent}%`,
              boxShadow: "0 0 16px var(--glow)",
            }}
          />
        </div>
      </PageHeader>

      <ol className="flex flex-col gap-3" aria-label="Lista de niveles">
        {levels.map((level, index) => {
          const status = progress[level.id]?.status ?? "locked";
          const locked = status === "locked";

          return (
            <li key={level.id}>
              <button
                type="button"
                disabled={locked}
                aria-disabled={locked}
                aria-label={`${level.title}, ${getStatusLabel(status)}`}
                onClick={() => {
                  play("tap");
                  enterLevel(level.id);
                }}
                className="group w-full text-left disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Surface
                  interactive={!locked}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--accent-soft)] font-display text-lg text-[var(--accent)] transition group-enabled:group-hover:border-[var(--accent)]/50">
                    {index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-xl leading-tight">
                      {level.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-[var(--muted)]">
                      {level.subtitle ?? level.type} · {getStatusLabel(status)}
                    </span>
                  </span>
                </Surface>
              </button>
            </li>
          );
        })}
      </ol>

      <Button
        variant="ghost"
        size="sm"
        onClick={resetJourney}
        className="self-start"
      >
        Reiniciar progreso
      </Button>
    </main>
  );
}
