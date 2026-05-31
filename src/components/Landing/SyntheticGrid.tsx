"use client";

import { m } from "motion/react";

const HUES = [265, 282, 232, 312, 248, 205, 292, 222, 258, 300];

function tileGradient(i: number) {
  const h1 = HUES[i % HUES.length];
  const h2 = (h1 + 38) % 360;
  return `linear-gradient(135deg, hsl(${h1} 72% 62% / 0.55), hsl(${h2} 64% 42% / 0.32))`;
}

export function SyntheticGrid({
  count = 120,
  cols = 12,
  className = "",
}: {
  count?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 grid gap-1.5 p-1.5 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(clamp(72px, ${Math.round(100 / cols)}vw, 150px), 1fr))`,
        gridAutoRows: `clamp(72px, ${Math.round(100 / cols)}vw, 150px)`,
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const entrance = (i % cols) * 0.03 + Math.floor(i / cols) * 0.05;
        return (
          <m.div
            key={i}
            className="rounded-lg border border-white/10"
            style={{ backgroundImage: tileGradient(i) }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: [0.5, 0.95, 0.5], scale: 1 }}
            transition={{
              scale: { duration: 0.5, delay: entrance, ease: [0, 0, 0.2, 1] },
              opacity: {
                duration: 7 + (i % 6),
                delay: entrance,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        );
      })}
    </div>
  );
}
