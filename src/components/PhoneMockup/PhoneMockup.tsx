"use client";

import { m } from "motion/react";
import { usePhoneMockup } from "./usePhoneMockup";

export function PhoneMockup({ className = "" }: { className?: string }) {
  const { loop, loopTransition } = usePhoneMockup();

  return (
    <m.div
      className={`relative aspect-[9/16] h-[64vh] max-h-[560px] min-h-[400px] rounded-[44px] border-[9px] border-neutral-700 bg-transparent shadow-[0_0_0_1.5px_rgba(0,0,0,0.7),0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-hairline-strong ${className}`}
      initial={{ opacity: 0, y: 40 }}
      animate={loop}
      transition={loopTransition}
      style={{ transformOrigin: "center" }}
    >
      <div className="absolute top-3 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-600" />

      <div className="absolute top-[120px] -right-[9px] h-16 w-[5px] rounded-r-lg bg-neutral-600" />
      <div className="absolute top-[190px] -left-[9px] h-9 w-[5px] rounded-l-lg bg-neutral-600" />
      <div className="absolute top-[232px] -left-[9px] h-9 w-[5px] rounded-l-lg bg-neutral-600" />

      <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-tr from-transparent via-surface to-surface-strong ring-1 ring-hairline ring-inset" />
    </m.div>
  );
}
