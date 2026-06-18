'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogBody, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfileCard } from '../ProfileCard'
import type { ProfilePublic, TabPublic } from '@/types/profile'

export function ImmersiveOverlay({
  profile,
  tabs,
  activeTabId,
  setActiveTabId,
  handleLinkClick,
}: {
  profile: ProfilePublic
  tabs: TabPublic[]
  activeTabId: string
  setActiveTabId: (id: string) => void
  handleLinkClick: (url: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [tabId, setTabId] = useState(activeTabId)
  if (tabId !== activeTabId) {
    setTabId(activeTabId)
    setOpen(false)
  }
  const displayName = profile.displayName || profile.username

  return (
    <>
      <div className="pointer-events-none fixed left-4 top-4 z-30 flex max-w-[45vw] items-center gap-3">
        <Avatar className="size-11 ring-2 ring-white/30">
          {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
          <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <span className="truncate text-base font-semibold text-white drop-shadow-lg">
          {displayName}
        </span>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/40 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/60"
      >
        <Link2 size={16} /> Links
      </button>

      <Dialog open={open} onOpenChange={setOpen} size="sm">
        <DialogHeader>
          <DialogTitle>{displayName}</DialogTitle>
        </DialogHeader>
        <DialogBody className="p-0">
          <ProfileCard
            variant="bare"
            reveal={open}
            profile={profile}
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            handleLinkClick={handleLinkClick}
          />
        </DialogBody>
      </Dialog>
    </>
  )
}
