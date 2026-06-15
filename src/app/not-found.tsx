import Link from 'next/link'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-app-bg px-6 text-center text-fg">
      <AmbientBackground />
      <div className="relative flex flex-col items-center gap-4">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">This page took a different link.</h1>
        <p className="max-w-sm text-fg-subtle">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild variant="primary" size="lg" className="mt-2">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  )
}
