import { Suspense } from "react";
import type { Metadata } from "next";
import { ExperiencePlayer } from "@/components/player/ExperiencePlayer";

export const metadata: Metadata = {
  title: "Para Mónica",
  description: "Una historia hecha para ti.",
};

export default function MonicaPage() {
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
