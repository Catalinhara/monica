"use client";

import { useExperienceSession } from "@/stores/experience-session";
import { Button } from "@/components/shared/Button";
import { PageHeader } from "@/components/shared/PageHeader";

const CLOSING_PHOTO =
  "/assets/uploads/exp-monica-001/1790097022066-84a71f84-whatsapp-image-2026-09-17-at-134138-4.png";

/** Shallower top cleft so faces stay inside the lobes. */
const HEART_PATH =
  "M0.5,0.96 C0.5,0.96 0.02,0.58 0.02,0.3 C0.02,0.12 0.14,0.01 0.31,0.01 C0.4,0.01 0.46,0.05 0.5,0.12 C0.54,0.05 0.6,0.01 0.69,0.01 C0.86,0.01 0.98,0.12 0.98,0.3 C0.98,0.58 0.5,0.96 0.5,0.96 Z";

export function JourneyComplete() {
  const experience = useExperienceSession((s) => s.experience)!;
  const openMap = useExperienceSession((s) => s.openMap);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <svg width={0} height={0} aria-hidden className="absolute">
        <defs>
          <clipPath id="closing-heart" clipPathUnits="objectBoundingBox">
            <path d={HEART_PATH} />
          </clipPath>
        </defs>
      </svg>

      <PageHeader
        align="center"
        title="Gracias por jugar"
        description="Has recorrido la experiencia completa. Puedes revisitar niveles desde el mapa."
      >
        <div className="mt-2 flex flex-col items-center gap-4">
          <div
            className="relative h-48 w-48"
            style={{ filter: "drop-shadow(0 0 16px var(--glow))" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 scale-[1.04] bg-[var(--accent)]"
              style={{
                clipPath: "url(#closing-heart)",
                transformOrigin: "center",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CLOSING_PHOTO}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
              style={{ clipPath: "url(#closing-heart)" }}
              draggable={false}
            />
          </div>
          <p className="text-sm text-[var(--accent)]">
            Hecho con amor para {experience.recipientName || "Monica"}
          </p>
        </div>
      </PageHeader>

      <Button onClick={openMap}>Volver</Button>
    </main>
  );
}
