'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, CreditCard, KeyRound, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { ChangePasswordDialog } from './ChangePasswordDialog'

const itemClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition data-[highlighted]:bg-surface-strong'

export function UserMenu({
  email,
  billingEnabled,
  subscriptionStatus,
}: {
  email: string
  billingEnabled: boolean
  subscriptionStatus: string | null
}) {
  const router = useRouter()
  const [pwOpen, setPwOpen] = useState(false)
  const hasActiveSub = subscriptionStatus === 'active'

  async function signOut() {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" className="px-3 font-normal text-fg-muted">
            <span className="hidden max-w-[160px] truncate sm:inline">{email}</span>
            <ChevronDown className="text-fg-subtle" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[200px] rounded-xl border border-hairline bg-app-bg/95 p-1 text-fg shadow-glass backdrop-blur-xl"
          >
            <div className="truncate px-3 py-2 text-xs text-fg-subtle sm:hidden">{email}</div>
            {billingEnabled &&
              (hasActiveSub ? (
                <DropdownMenu.Item className={itemClass} onSelect={() => authClient.customer.portal()}>
                  <CreditCard size={15} /> Manage subscription
                </DropdownMenu.Item>
              ) : (
                <DropdownMenu.Item className={itemClass} onSelect={() => authClient.checkout({ slug: 'pro' })}>
                  <CreditCard size={15} /> Subscribe
                </DropdownMenu.Item>
              ))}
            <DropdownMenu.Item className={itemClass} onSelect={() => setPwOpen(true)}>
              <KeyRound size={15} /> Change password
            </DropdownMenu.Item>
            <DropdownMenu.Item className={`${itemClass} text-danger`} onSelect={signOut}>
              <LogOut size={15} /> Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </>
  )
}
