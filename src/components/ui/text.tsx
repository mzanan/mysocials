import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  display:
    "text-[2.4rem] leading-[1.05] font-bold tracking-tight text-balance text-fg sm:text-[2.6rem] lg:text-[3.2rem]",
  title: "text-2xl font-semibold tracking-tight text-fg",
  heading: "text-sm font-semibold text-fg",
  body: "text-[15px] leading-relaxed text-fg-muted",
  label: "text-xs font-medium text-fg-subtle",
  caption: "text-xs text-fg-subtle",
} as const;

export function Text({
  as,
  variant = "body",
  className,
  children,
  ...props
}: {
  as?: ElementType;
  variant?: keyof typeof VARIANTS;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"p">) {
  const Comp = as ?? "p";
  return (
    <Comp className={cn(VARIANTS[variant], className)} {...props}>
      {children}
    </Comp>
  );
}
