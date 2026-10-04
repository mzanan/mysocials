"use client";

import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "focus-visible:outline-accent/40 relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-offset-2 transition-colors duration-200 focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-fg" : "bg-fg-faint",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "bg-knob inline-block size-6 rounded-full shadow-md transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}
