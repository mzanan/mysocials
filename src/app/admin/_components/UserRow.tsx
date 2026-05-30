'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

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
  revoked: 'text-red-300',
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
    <tr className="text-white/80">
      <td className="px-4 py-3">
        <div className="font-medium text-white">{user.name || '—'}</div>
        <div className="text-xs text-white/40">{user.email}</div>
      </td>
      <td className="px-4 py-3">
        {user.username ? (
          <Link href={`/${user.username}`} target="_blank" className="text-white/70 hover:underline">
            /{user.username}
            {user.published ? '' : ' (draft)'}
          </Link>
        ) : (
          '—'
        )}
      </td>
      <td className={`px-4 py-3 ${subColor[user.subscriptionStatus ?? ''] ?? 'text-white/40'}`}>
        {user.subscriptionStatus ?? 'none'}
      </td>
      <td className="px-4 py-3">
        {role === 'admin' ? <span className="text-violet-300">admin</span> : 'user'}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
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
            className="rounded border border-white/10 bg-white/[0.06] px-2 py-1 hover:bg-white/[0.1]"
          >
            {banned ? 'Unban' : 'Ban'}
          </button>
          <button
            disabled={pending}
            onClick={() =>
              run(async () => {
                const next = role === 'admin' ? 'user' : 'admin'
                await authClient.admin.setRole({ userId: user.id, role: next })
                setRole(next)
              })
            }
            className="rounded border border-white/10 bg-white/[0.06] px-2 py-1 hover:bg-white/[0.1]"
          >
            {role === 'admin' ? 'Make user' : 'Make admin'}
          </button>
          <button
            disabled={pending}
            onClick={() =>
              run(async () => {
                await authClient.admin.impersonateUser({ userId: user.id })
                router.push('/dashboard')
              })
            }
            className="rounded border border-white/10 bg-white/[0.06] px-2 py-1 hover:bg-white/[0.1]"
          >
            Impersonate
          </button>
        </div>
      </td>
    </tr>
  )
}
