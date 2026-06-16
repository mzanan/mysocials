import Link from 'next/link'
import { cn } from '@/lib/utils'

const linkClass = 'underline-offset-4 transition-colors hover:text-fg-muted hover:underline'

export function BrandFooter({ overlay = false, className }: { overlay?: boolean; className?: string }) {
  return (
    <footer
      className={cn(
        'text-center text-xs text-fg-faint',
        overlay ? 'absolute inset-x-0 bottom-6 z-20 lg:bottom-8' : 'relative z-10 py-6',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1',
          overlay && 'rounded-full bg-app-bg/55 px-4 py-2 text-fg-subtle ring-1 ring-hairline backdrop-blur-md',
        )}
      >
        <span>
          A product by{' '}
          <a href="https://itsmatias.com" target="_blank" rel="noopener noreferrer" className={linkClass}>
            itsmatias.com
          </a>
        </span>
        <span aria-hidden>·</span>
        <Link href="/terms" className={linkClass}>
          Terms
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className={linkClass}>
          Privacy
        </Link>
      </span>
    </footer>
  )
}
