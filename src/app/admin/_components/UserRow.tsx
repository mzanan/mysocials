'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

interface AdminUser {
  id: string
  email: string
  name: string | null
  role: string
  banned: boolean
  createdAt: Date
  username: string | null
  published: boolean | null
  subscriptionStatus: string | null
}

const subColor: Record<string, string> = {
  active: 'text-emerald-300',
  canceled: 'text-amber-300',
  past_due: 'text-amber-300',
  revoked: 'text-danger',
}

export function UserRow({ user }: { user: AdminUser }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [banned, setBanned] = useState(user.banned)
  const [role, setRole] = useState(user.role)

  function run(fn: () => Promise<unknown>) {
    startTransition(async () => {
      await fn()
      router.refresh()
    })
  }

  return (
    <tr className="text-fg-muted">
      <td className="px-4 py-3">
        <div className="font-medium text-fg">{user.name || '-'}</div>
        <div className="text-xs text-fg-subtle">{user.email}</div>
      </td>
      <td className="px-4 py-3">
        {user.username ? (
          <Link href={`/${user.username}`} target="_blank" className="text-fg-muted hover:underline">
            /{user.username}
            {user.published ? '' : ' (draft)'}
          </Link>
        ) : (
          '-'
        )}
      </td>
      <td className={`px-4 py-3 ${subColor[user.subscriptionStatus ?? ''] ?? 'text-fg-subtle'}`}>
        {user.subscriptionStatus ?? 'none'}
      </td>
      <td className="px-4 py-3">
        {role === 'admin' ? <span className="text-violet-300">admin</span> : 'user'}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() =>
              run(async () => {
                if (banned) {
                  await authClient.admin.unbanUser({ userId: user.id })
                  setBanned(false)
                } else {
                  await authClient.admin.banUser({ userId: user.id })
                  setBanned(true)
                }
              })
            }
          >
            {banned ? 'Unban' : 'Ban'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const next = role === 'admin' ? 'user' : 'admin'
                await authClient.admin.setRole({ userId: user.id, role: next })
                setRole(next)
              })
            }
          >
            {role === 'admin' ? 'Make user' : 'Make admin'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={pending}
            onClick={() =>
              run(async () => {
                await authClient.admin.impersonateUser({ userId: user.id })
                router.push('/dashboard')
              })
            }
          >
            Impersonate
          </Button>
        </div>
      </td>
    </tr>
  )
}
