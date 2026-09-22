"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  count?: number;
  /** Continuous rain from the top (celebration). Default: one-shot burst. */
  continuous?: boolean;
  className?: string;
};

export function ParticleField({
  count = 28,
  continuous = false,
  className = "",
}: Props) {
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: continuous ? Math.random() * 4 : Math.random() * 0.25,
        duration: continuous
          ? 3.2 + Math.random() * 2.8
          : 1.35 + Math.random() * 0.5,
        size: continuous ? 5 + Math.random() * 7 : 4 + Math.random() * 6,
        drift: (Math.random() - 0.5) * (continuous ? 80 : 420),
        rotate: (Math.random() - 0.5) * 540,
        color:
          i % 4 === 0
            ? "var(--accent)"
            : i % 4 === 1
              ? "#f5d0d8"
              : i % 4 === 2
                ? "#ffffff"
                : "#e8a0b0",
        shape: i % 3 === 0 ? "rect" : "circle",
      })),
    [count, continuous],
  );

  if (reduceMotion) return null;

  if (continuous) {
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      >
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className={`absolute ${
              p.shape === "rect" ? "rounded-[1px]" : "rounded-full"
            }`}
            style={{
              left: `${p.left}%`,
              top: "-8%",
              width: p.shape === "rect" ? p.size * 0.55 : p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
            animate={{
              y: ["0vh", "115vh"],
              x: [0, p.drift],
              rotate: [0, p.rotate],
              opacity: [0, 1, 1, 0.85, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "linear",
              repeat: Infinity,
              repeatDelay: Math.random() * 0.6,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[35%] left-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.drift, y: 80 + Math.random() * 260, scale: 0.3 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
