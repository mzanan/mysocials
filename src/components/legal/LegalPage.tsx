import Link from 'next/link'
import type { ReactNode } from 'react'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { BrandFooter } from '@/components/ui/BrandFooter'
import { Text } from '@/components/ui/text'

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
        <Text as="h1" variant="title" className="mt-8 text-3xl sm:text-4xl">
          {title}
        </Text>
        <Text variant="caption" className="mt-2 text-sm">
          Last updated {updated}
        </Text>
        <div className="mt-10 flex flex-col gap-8 text-[15px] leading-relaxed text-fg-muted">
          {children}
        </div>
      </div>
      <BrandFooter />
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
      <Text as="h2" variant="heading" className="mb-3 text-lg">
        {title}
      </Text>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
