'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { LazyMotion, domAnimation } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { usePublicProfile } from './usePublicProfile'
import { ProfileCard } from './ProfileCard'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import { VideoWall } from '@/components/Backgrounds/VideoWall/VideoWall'
import { BrandFooter } from '@/components/ui/BrandFooter'
import type { Theme } from '@/lib/appearance'
import type { ProfilePublic } from '@/types/profile'

const PUB_THEME_KEY = 'ms-pub-theme'
const pubThemeListeners = new Set<() => void>()
function subscribePubTheme(cb: () => void) {
  pubThemeListeners.add(cb)
  return () => pubThemeListeners.delete(cb)
}
function getPubTheme(): Theme | null {
  try {
    const t = localStorage.getItem(PUB_THEME_KEY)
    return t === 'dark' || t === 'light' ? t : null
  } catch {
    return null
  }
}
function setPubTheme(next: Theme) {
  try {
    localStorage.setItem(PUB_THEME_KEY, next)
  } catch {}
  pubThemeListeners.forEach((l) => l())
}

export function PublicProfile({ profile }: { profile: ProfilePublic }) {
  const { tabs, activeTabId, setActiveTabId, handleLinkClick } = usePublicProfile(profile)

  const [everActivated, setEverActivated] = useState<Set<string>>(() => new Set([activeTabId]))
  if (!everActivated.has(activeTabId)) {
    setEverActivated((prev) => new Set(prev).add(activeTabId))
  }

  const [showCard, setShowCard] = useState(false)
  const [cardTabId, setCardTabId] = useState(activeTabId)
  if (cardTabId !== activeTabId) {
    setCardTabId(activeTabId)
    setShowCard(false)
  }
  const revealCard = useCallback(() => setShowCard(true), [])

  const storedTheme = useSyncExternalStore(subscribePubTheme, getPubTheme, () => null)
  const theme: Theme = storedTheme ?? profile.theme
  function toggleTheme() {
    setPubTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const t = setTimeout(() => setShowCard(true), 4000)
    return () => clearTimeout(t)
  }, [activeTabId])

  return (
    <LazyMotion features={domAnimation}>
      <div
        data-theme={theme}
        className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-app-bg"
        style={{ ['--accent-glow' as string]: profile.accent }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute right-4 top-4 z-30 grid h-9 w-9 place-items-center rounded-full border border-hairline-strong bg-surface text-fg-muted backdrop-blur-md transition hover:text-fg"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {tabs.map((tab) =>
          everActivated.has(tab.id) ? (
            <div
              key={tab.id}
              className={
                tab.id === activeTabId ? 'visible' : 'invisible fixed inset-0 pointer-events-none'
              }
            >
              {tab.type === 'video' ? (
                <VideoWall
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
          style={{
            visibility: showCard ? 'visible' : 'hidden',
            pointerEvents: showCard ? 'auto' : 'none',
          }}
        >
          <ProfileCard
            reveal={showCard}
            profile={profile}
            tabs={tabs}
            activeTabId={activeTabId}
            setActiveTabId={setActiveTabId}
            handleLinkClick={handleLinkClick}
          />
        </div>

        <BrandFooter overlay />
        <div aria-hidden className="grain-overlay" />
      </div>
    </LazyMotion>
  )
}
