import type { ReactNode } from "react"

export function Card({
  children,
  title,
  desc,
  action,
}: {
  children: ReactNode
  title?: string
  desc?: string
  action?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
      {(title || action) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {desc && <p className="mt-0.5 text-xs text-white/45">{desc}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
