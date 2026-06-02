"use client";

import { m } from "motion/react";

const FACE_COUNT = 60;
const FACES = Array.from(
  { length: FACE_COUNT },
  (_, i) => `/people/p${String(i + 1).padStart(2, "0")}.webp`
);

function faceFor(i: number) {
  const block = Math.floor(i / FACE_COUNT);
  return FACES[(i * 23 + block * 7) % FACE_COUNT];
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
            className="rounded-lg border border-white/10 bg-white/[0.04] bg-cover bg-center"
            style={{ backgroundImage: `url(${faceFor(i)})` }}
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: [0.55, 0.92, 0.55], scale: 1 }}
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
