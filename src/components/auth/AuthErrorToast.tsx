'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/lib/toast'

const messages: Record<string, string> = {
  account_not_linked:
    "We couldn't link your Google account. Sign in with email first, then connect Google from settings.",
  signup_disabled: 'Sign-ups are currently disabled.',
  email_doesnt_match: "The Google email doesn't match this account.",
  unable_to_create_user: "We couldn't create your account. Try again.",
}

export function AuthErrorToast() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const error = params.get('error')

  useEffect(() => {
    if (!error) return
    toast.error(messages[error] ?? "Something went wrong. Please try again.")
    const next = new URLSearchParams(params.toString())
    next.delete('error')
    next.delete('error_description')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [error, params, pathname, router])

  return null
}
