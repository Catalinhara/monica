"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Props = {
  count?: number;
  className?: string;
};

export function ParticleField({ count = 28, className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 420,
        y: 80 + Math.random() * 260,
        delay: Math.random() * 0.25,
        size: 4 + Math.random() * 6,
        color:
          i % 3 === 0 ? "var(--accent)" : i % 3 === 1 ? "#f5d0d8" : "#ffffff",
      })),
    [count],
  );

  if (reduceMotion) return null;

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
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0.3 }}
          transition={{
            duration: 1.35 + Math.random() * 0.5,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
