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
        "focus-visible:outline-accent/40 relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 ring-1 ring-inset outline-offset-2 transition-colors focus-visible:outline-2 disabled:opacity-50",
        checked
          ? "bg-fg ring-fg"
          : "bg-surface-strong ring-hairline-strong",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-5 rounded-full shadow transition-transform",
          checked ? "bg-app-bg translate-x-5" : "bg-fg translate-x-0",
        )}
      />
    </button>
  );
}
