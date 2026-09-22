"use client";

import { useEffect } from "react";
import { usePrefsStore } from "@/stores/prefs-store";

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 10v4h3.2L12 18V6L7.2 10H4z" />
      {muted ? (
        <path d="M16 9l5 5M21 9l-5 5" />
      ) : (
        <>
          <path d="M15.2 9.2a3.2 3.2 0 010 5.6" />
          <path d="M17.5 6.8a6 6 0 010 10.4" />
        </>
      )}
    </svg>
  );
}

export function SoundToggle({ className = "" }: { className?: string }) {
  const hydrate = usePrefsStore((s) => s.hydrate);
  const muted = usePrefsStore((s) => s.muted);
  const hydrated = usePrefsStore((s) => s.hydrated);
  const toggleMute = usePrefsStore((s) => s.toggleMute);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) return null;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-pressed={muted}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      title={muted ? "Activar sonido" : "Silenciar sonido"}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white/[0.04] text-[var(--muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--foreground)] ${className}`}
    >
      <SpeakerIcon muted={muted} />
    </button>
  );
}
