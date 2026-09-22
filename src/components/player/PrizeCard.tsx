"use client";

import type { PrizeMotif } from "@/types";

type Props = {
  label: string;
  motif?: PrizeMotif | string;
  imageSrc?: string;
  selected?: boolean;
  compact?: boolean;
  /** When false, only the image is shown (no overlay title). */
  showLabel?: boolean;
  className?: string;
};

const MOTIF_IMAGES: Record<PrizeMotif, string> = {
  dinner: "/prizes/cena.jpg",
  trip: "/prizes/viaje.jpg",
  dance: "/prizes/baile.jpg",
  escape: "/prizes/escapada.jpg",
};

export function resolvePrizeImage(option: {
  motif?: string;
  imageSrc?: string;
  id?: string;
}): string | undefined {
  if (option.imageSrc) return option.imageSrc;
  const motif = resolvePrizeMotif(option);
  if (motif && motif in MOTIF_IMAGES) {
    return MOTIF_IMAGES[motif as PrizeMotif];
  }
  return undefined;
}

export function resolvePrizeMotif(
  option: { id?: string; motif?: string },
): PrizeMotif | string | undefined {
  if (option.motif) return option.motif;
  const id = option.id?.toLowerCase();
  if (id === "dinner" || id === "trip" || id === "dance" || id === "escape") {
    return id;
  }
  if (id === "cena") return "dinner";
  if (id === "viaje") return "trip";
  if (id === "baile") return "dance";
  if (id === "escapada") return "escape";
  return undefined;
}

export function PrizeCard({
  label,
  motif,
  imageSrc,
  selected = false,
  compact = false,
  showLabel = true,
  className = "",
}: Props) {
  const src =
    imageSrc ??
    resolvePrizeImage({ motif, imageSrc }) ??
    (motif && motif in MOTIF_IMAGES
      ? MOTIF_IMAGES[motif as PrizeMotif]
      : undefined);

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border text-left transition duration-200 ${
        selected
          ? "border-[var(--accent)] shadow-[0_0_24px_var(--glow)]"
          : "border-[var(--border)]"
      } ${className}`}
    >
      <div
        className={`relative w-full overflow-hidden bg-black/40 ${
          compact ? "aspect-[4/3]" : "aspect-square"
        }`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- static prize assets in /public
          <img
            src={src}
            alt={showLabel ? "" : label}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted)]">
            Sin imagen
          </div>
        )}
        {showLabel && (
          <>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
              aria-hidden
            />
            <span
              className={`absolute inset-x-0 bottom-0 font-medium tracking-wide text-white ${
                compact ? "px-3 pb-2.5 text-sm" : "px-3.5 pb-3 text-base"
              }`}
            >
              {label}
            </span>
          </>
        )}
      </div>
      {selected && (
        <div
          className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-[var(--accent)]"
          aria-hidden
        />
      )}
    </div>
  );
}
