'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { toast } from '@/lib/toast'

export function useChangePassword(onDone: () => void) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [pending, setPending] = useState(false)

  async function submit() {
    setPending(true)
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    })
    setPending(false)
    if (error) {
      toast.error(error.message ?? 'Could not change password')
      return
    }
    toast.success('Password updated')
    setCurrent('')
    setNext('')
    onDone()
  }

  return { current, setCurrent, next, setNext, pending, submit }
}
