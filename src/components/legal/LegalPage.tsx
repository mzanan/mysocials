import Link from 'next/link'
import type { ReactNode } from 'react'
import { AmbientBackground } from '@/components/ui/AmbientBackground'

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <main className="relative min-h-dvh bg-app-bg text-fg">
      <AmbientBackground />
      <div className="relative mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <Link
          href="/"
          className="text-sm text-fg-subtle underline-offset-4 transition-colors hover:text-fg-muted hover:underline"
        >
          ← mySocials
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-fg-subtle">Last updated {updated}</p>
        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-fg-muted">
          {children}
        </div>
      </div>
    </main>
  )
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-lg font-semibold text-fg">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
