'use client'

import { AmbientBackground } from '@/components/ui/AmbientBackground'
import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-app-bg px-6 text-center text-fg">
      <AmbientBackground />
      <div className="relative flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="max-w-sm text-fg-subtle">An unexpected error occurred. Please try again.</p>
        <Button variant="primary" size="lg" className="mt-2" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  )
}
