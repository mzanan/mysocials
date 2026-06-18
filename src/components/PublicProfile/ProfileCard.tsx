'use client'

import { AnimatePresence, m } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileLinkButton } from './ProfileLinkButton'
import type { ProfilePublic, TabPublic } from '@/types/profile'

export function ProfileCard({
  profile,
  tabs,
  activeTabId,
  setActiveTabId,
  handleLinkClick,
  reveal,
}: {
  profile: ProfilePublic
  tabs: TabPublic[]
  activeTabId: string
  setActiveTabId: (id: string) => void
  handleLinkClick: (url: string) => void
  reveal: boolean
}) {
  const displayName = profile.displayName || profile.username
  const multiTab = tabs.length > 1
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTabId),
  )

  return (
    <div className="relative mx-auto w-[340px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-glass-lg">
      <div className="absolute inset-0 rounded-3xl border border-hairline-strong bg-surface backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
      <m.div
        className="relative p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: reveal ? 1 : 0, y: reveal ? 0 : 12 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex items-center justify-center pb-4 md:flex-col-reverse">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[1.7rem] font-semibold tracking-tight text-fg drop-shadow-md">
              {displayName}
            </h1>
            {profile.bio && (
              <AnimatePresence mode="wait">
                <m.p
                  key={activeTabId}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="whitespace-pre-line text-sm tracking-wide text-fg-muted drop-shadow-md"
                >
                  {profile.bio}
                </m.p>
              </AnimatePresence>
            )}
          </div>
          <Avatar className="mx-auto h-24 w-24 ring-2 ring-hairline-strong md:mb-2">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
          {multiTab && (
            <TabsList
              className="relative mb-6 grid h-11 w-full rounded-xl border border-hairline bg-surface p-1 backdrop-blur-md"
              style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
            >
              <m.span
                aria-hidden
                className="absolute inset-y-1 left-1 rounded-lg border border-hairline-strong bg-surface-stronger shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                style={{ width: `calc(${100 / tabs.length}% - 0.25rem)` }}
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="relative z-10 bg-transparent text-fg-subtle shadow-none transition-colors hover:text-fg-muted data-[state=active]:bg-transparent data-[state=active]:text-fg data-[state=active]:shadow-none"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          )}

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-3">
              {tab.links.map((link) => (
                <ProfileLinkButton
                  key={`${tab.id}-${link.url}`}
                  link={link}
                  onClick={() => handleLinkClick(link.url)}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </m.div>
    </div>
  )
}
