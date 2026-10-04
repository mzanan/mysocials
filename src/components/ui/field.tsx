import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Field({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  )
}
