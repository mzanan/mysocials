'use client'

import { useState } from 'react'
import { authClient, useSession } from '@/lib/auth-client'

export function ImpersonationBanner() {
  const { data } = useSession()
  const [pending, setPending] = useState(false)
  const impersonating = Boolean(
    (data?.session as { impersonatedBy?: string | null } | undefined)?.impersonatedBy,
  )
  if (!impersonating) return null

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-fg px-4 py-2 text-center text-xs text-app-bg">
      <span>Impersonating {data?.user?.email}.</span>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          await authClient.admin.stopImpersonating()
          window.location.href = '/admin'
        }}
        className="font-medium underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-60"
      >
        {pending ? 'Returning…' : 'Stop impersonating'}
      </button>
    </div>
  )
}
