import { Suspense } from "react";
import { ExperiencePlayer } from "@/components/player/ExperiencePlayer";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-[var(--muted)]">
          Cargando…
        </div>
      }
    >
      <ExperiencePlayer />
    </Suspense>
  );
}
