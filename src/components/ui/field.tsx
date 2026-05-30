import type { ReactNode } from "react"

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-white/55">{label}</span>
      {children}
    </label>
  )
}
