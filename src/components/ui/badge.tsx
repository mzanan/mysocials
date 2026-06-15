import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-strong px-3 py-1.5 text-xs font-medium text-fg",
        className,
      )}
      {...props}
    />
  );
}
