import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SignupCta({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'absolute left-4 top-4 z-30 inline-flex h-9 items-center gap-1.5 rounded-full border border-hairline-strong bg-surface px-4 text-sm font-medium text-fg-muted backdrop-blur-md transition hover:text-fg',
        className,
      )}
    >
      Create your own
      <ArrowUpRight size={15} />
    </Link>
  )
}
