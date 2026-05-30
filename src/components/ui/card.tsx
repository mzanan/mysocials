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
    <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.10)] shadow-[0_16px_50px_-30px_rgba(0,0,0,0.7)]">
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
