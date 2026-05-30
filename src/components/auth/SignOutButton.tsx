'use client'

import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function SignOutButton() {
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await authClient.signOut()
        router.push('/login')
        router.refresh()
      }}
      className="h-9 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-white/80 transition hover:bg-white/[0.1]"
    >
      Sign out
    </button>
  )
}
