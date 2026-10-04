import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingRow({
  title,
  description,
  control,
  className,
}: {
  title: string;
  description?: string;
  control: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "border-hairline bg-surface-strong hover:bg-surface-stronger flex cursor-pointer items-start gap-4 rounded-2xl border px-4 py-3.5 transition-colors",
        className,
      )}
    >
      {control}
      <span className="flex min-w-0 flex-col gap-0.5 pt-0.5">
        <span className="text-fg text-sm font-medium">{title}</span>
        {description && (
          <span className="text-fg-subtle text-[13px] leading-snug">
            {description}
          </span>
        )}
      </span>
    </label>
  );
}
