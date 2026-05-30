import type { ReactNode } from 'react'

export const inputCls =
  'w-full h-10 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:bg-white/[0.08]'

export const btnCls =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 text-sm font-medium text-white transition hover:bg-white/[0.1] disabled:opacity-50'

export const btnPrimaryCls =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.12] px-3 text-sm font-medium text-white transition hover:bg-white/[0.16] disabled:opacity-50'

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

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/55">{label}</span>
      {children}
    </label>
  )
}
