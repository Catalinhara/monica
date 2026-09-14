"use client";

import { useExperienceSession } from "@/stores/experience-session";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";

export function JourneyComplete() {
  const experience = useExperienceSession((s) => s.experience)!;
  const openMap = useExperienceSession((s) => s.openMap);
  const resetJourney = useExperienceSession((s) => s.resetJourney);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <PageHeader
        align="center"
        eyebrow="Fin del viaje"
        title="Gracias por jugar"
        description="Has recorrido la experiencia completa. Puedes revisitar niveles desde el mapa o reiniciar el progreso."
      >
        <p className="text-sm text-[var(--accent)]">
          Para {experience.recipientName}
        </p>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={openMap}>
          Ver mapa
        </Button>
        <Button onClick={resetJourney}>Empezar de nuevo</Button>
      </div>
    </main>
  );
}
