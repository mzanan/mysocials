'use client'

import { Button } from '@/components/ui/button'
import { StatusPage } from '@/components/ui/StatusPage'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage
      lead="Something"
      accent="went wrong."
      message="An unexpected error occurred. Please try again."
      action={
        <Button variant="primary" size="auth" className="px-8" onClick={reset}>
          Try again
        </Button>
      }
    />
  )
}
