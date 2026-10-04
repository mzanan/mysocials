import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function Card({
  children,
  title,
  desc,
  action,
  className,
  padded = true,
}: {
  children: ReactNode
  title?: string
  desc?: string
  action?: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-hairline bg-surface backdrop-blur-xl [box-shadow:inset_0_1px_0_0_var(--color-hairline)] shadow-[var(--shadow-card)]",
        padded && "p-4 sm:p-6",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold tracking-tight text-fg">{title}</h2>}
            {desc && <p className="mt-1 text-sm text-fg-subtle">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
