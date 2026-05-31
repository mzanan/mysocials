'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, KeyRound, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { ChangePasswordDialog } from './ChangePasswordDialog'

const itemClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition data-[highlighted]:bg-white/[0.08]'

export function UserMenu({ email }: { email: string }) {
  const router = useRouter()
  const [pwOpen, setPwOpen] = useState(false)

  async function signOut() {
    await authClient.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="glass" className="px-3 font-normal text-white/80">
            <span className="hidden max-w-[160px] truncate sm:inline">{email}</span>
            <ChevronDown className="text-white/45" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[200px] rounded-xl border border-white/10 bg-app-bg/95 p-1 text-white shadow-glass backdrop-blur-xl"
          >
            <div className="truncate px-3 py-2 text-xs text-white/45 sm:hidden">{email}</div>
            <DropdownMenu.Item className={itemClass} onSelect={() => setPwOpen(true)}>
              <KeyRound size={15} /> Change password
            </DropdownMenu.Item>
            <DropdownMenu.Item className={`${itemClass} text-red-300`} onSelect={signOut}>
              <LogOut size={15} /> Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </>
  )
}
