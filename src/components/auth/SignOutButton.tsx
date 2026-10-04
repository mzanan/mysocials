'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { resetAnalytics } from '@/lib/consent'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await authClient.signOut()
        resetAnalytics()
        router.push('/')
        router.refresh()
      }}
    >
      Sign out
    </Button>
  )
}
