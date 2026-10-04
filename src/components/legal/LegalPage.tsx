import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { Badge } from '@/components/ui/badge'
import { BrandFooter } from '@/components/ui/BrandFooter'
import { Card } from '@/components/ui/card'
import { DisplayTitle } from '@/components/ui/DisplayTitle'
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
    <main className="relative min-h-dvh overflow-clip bg-app-bg text-fg">
      <AmbientBackground />
      <div className="relative mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-fg-subtle transition-colors hover:text-fg"
        >
          <ArrowLeft size={15} /> mySocials
        </Link>
        <div className="mt-8 flex flex-col items-start gap-4">
          <Badge>Last updated {updated}</Badge>
          <DisplayTitle lead={title} size="md" />
        </div>
        <Card className="mt-10 p-6 sm:p-10">
          <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-fg-muted">{children}</div>
        </Card>
      </div>
      <BrandFooter />
      <div aria-hidden className="grain-overlay" />
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
      <Text as="h2" variant="heading" className="mb-3 text-lg tracking-tight">
        {title}
      </Text>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}
