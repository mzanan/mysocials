'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { ChevronRight, ShoppingBag, ShoppingCart, Code, type LucideIcon } from 'lucide-react'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react'
import { usePublicProfile, iconContainerClasses } from './usePublicProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SocialIcon } from '@/components/SocialIcon/SocialIcon'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import type { ProfilePublic } from '@/types/profile'

const DevBackground = dynamic(
  () => import('@/components/Backgrounds/DevBackground/DevBackground').then((m) => ({ default: m.DevBackground })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gradient-to-br from-app-bg via-app-bg-2 to-app-bg-3" />
    ),
  },
)

const linkIcons: Record<string, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  code: Code,
}

export function PublicProfile({ profile }: { profile: ProfilePublic }) {
  const { tabs, activeTabId, setActiveTabId, handleLinkClick } = usePublicProfile(profile)

  const everActivatedRef = useRef<Set<string>>(new Set([activeTabId]))
  everActivatedRef.current.add(activeTabId)

  const [showCard, setShowCard] = useState(false)
  const revealCard = useCallback(() => setShowCard(true), [])
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.id === activeTabId))
  const multiTab = tabs.length > 1
  const displayName = profile.displayName || profile.username

  useEffect(() => {
    setShowCard(false)
    const t = setTimeout(() => setShowCard(true), 4000)
    return () => clearTimeout(t)
  }, [activeTabId])

  return (
    <LazyMotion features={domAnimation}>
      <div
        className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-app-bg"
        style={{ ['--accent-glow' as string]: profile.accent }}
      >
        {tabs.map((tab) =>
          everActivatedRef.current.has(tab.id) ? (
            <div
              key={tab.id}
              className={tab.id === activeTabId ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}
            >
              {tab.type === 'video' ? (
                <DevBackground
                  isActive={tab.id === activeTabId}
                  videos={tab.media.map((md) => ({ url: md.url, posterUrl: md.posterUrl }))}
                  onReady={revealCard}
                />
              ) : (
                <PersonalBackground
                  isActive={tab.id === activeTabId}
                  initialImages={tab.media.map((md) => md.url)}
                  onReady={revealCard}
                />
              )}
            </div>
          ) : null,
        )}

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]"
        />

        <div
          className="relative z-10 flex flex-col items-center justify-center"
          style={{ visibility: showCard ? 'visible' : 'hidden', pointerEvents: showCard ? 'auto' : 'none' }}
        >
          <div className="relative w-[340px] rounded-3xl shadow-glass-lg">
            <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
            <m.div
              className="relative p-8"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: showCard ? 1 : 0, y: showCard ? 0 : 12 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="flex items-center justify-center pb-4 md:flex-col-reverse">
                <div className="flex flex-col gap-2 text-center">
                  <h1 className="text-[1.7rem] font-semibold tracking-tight text-white drop-shadow-md">
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
                        className="whitespace-pre-line text-sm tracking-wide text-white/75 drop-shadow-md"
                      >
                        {profile.bio}
                      </m.p>
                    </AnimatePresence>
                  )}
                </div>
                <Avatar className="mx-auto h-24 w-24 ring-2 ring-white/15 md:mb-2">
                  {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
                {multiTab && (
                  <TabsList
                    className="relative mb-6 grid h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] p-1 backdrop-blur-md"
                    style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}
                  >
                    <m.span
                      aria-hidden
                      className="absolute inset-y-1 left-1 rounded-lg border border-white/15 bg-white/[0.14] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                      style={{ width: `calc(${100 / tabs.length}% - 0.25rem)` }}
                      animate={{ x: `${activeIndex * 100}%` }}
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="relative z-10 bg-transparent text-white/55 shadow-none transition-colors hover:text-white/80 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-3">
                    {tab.links.map((link) => {
                      const Icon = link.icon ? linkIcons[link.icon] : null
                      return (
                        <Button
                          key={`${tab.id}-${link.url}`}
                          variant="outline"
                          className="group link-btn flex h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-2xl border-white/10 bg-white/[0.06] px-4 text-base font-medium text-white backdrop-blur-md"
                          onClick={() => handleLinkClick(link.url)}
                        >
                          {Icon ? (
                            <span className={`${iconContainerClasses} text-white/85`}>
                              <Icon size={22} strokeWidth={1.8} />
                            </span>
                          ) : link.iconUrl ? (
                            <div className={`${iconContainerClasses} rounded-full bg-black`}>
                              <Image
                                src={link.iconUrl}
                                alt={`${link.title} icon`}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <span className={`${iconContainerClasses} text-white/85`}>
                              <SocialIcon url={link.url} size={22} />
                            </span>
                          )}
                          <span className="flex-1 text-left">{link.title}</span>
                          <ChevronRight className="link-chev size-5 -translate-x-1 text-white/40 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                        </Button>
                      )
                    })}
                  </TabsContent>
                ))}
              </Tabs>
            </m.div>
          </div>
        </div>
        <div aria-hidden className="grain-overlay" />
      </div>
    </LazyMotion>
  )
}
