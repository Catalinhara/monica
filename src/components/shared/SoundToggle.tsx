"use client";

import { useEffect } from "react";
import { usePrefsStore } from "@/stores/prefs-store";
import { Button } from "@/components/shared/Button";

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
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={toggleMute}
      aria-pressed={muted}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
    >
      {muted ? "Sonido off" : "Sonido on"}
    </Button>
  );
}
