"use client";

import { LazyMotion, domAnimation, m } from "motion/react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const LINES = [
  { words: ["Your", "whole", "world,"], accent: false, nowrap: false },
  { words: ["one", "link."], accent: true, nowrap: true },
] as const;

const BASE_DELAY = 0.15;
const WORD_STAGGER = 0.13;
const LINE_PAUSE = 0.45;

function Word({ children, delay }: { children: string; delay: number }) {
  return (
    <m.span
      className="inline-block"
      initial={{ opacity: 0, y: "0.5em" }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.span>
  );
}

export function HeroHeadline() {
  const starts = LINES.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + LINES[i - 1].words.length);
    return acc;
  }, []);

  return (
    <div className="@container">
      <Text
        as="h1"
        variant="display"
        className="text-[length:clamp(2.4rem,16cqi,4.25rem)]! leading-[0.95]!"
      >
        <LazyMotion features={domAnimation}>
          {LINES.map((line, li) => (
            <span
              key={li}
              className={cn(
                "flex flex-wrap justify-center gap-x-[0.22em] lg:justify-start",
                line.nowrap && "flex-nowrap whitespace-nowrap",
                line.accent && "text-accent",
              )}
            >
              {line.words.map((w, wi) => (
                <Word
                  key={wi}
                  delay={
                    BASE_DELAY +
                    (starts[li] + wi) * WORD_STAGGER +
                    (li > 0 ? LINE_PAUSE : 0)
                  }
                >
                  {w}
                </Word>
              ))}
            </span>
          ))}
        </LazyMotion>
      </Text>
    </div>
  );
}
