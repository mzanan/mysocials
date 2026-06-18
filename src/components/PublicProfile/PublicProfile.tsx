'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { LazyMotion, domAnimation } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePublicProfile } from './usePublicProfile'
import { ProfileCard } from './ProfileCard'
import { LayoutSwitcher } from './LayoutSwitcher'
import { useVideoLayout } from './useVideoLayout'
import { VideoGallery } from './VideoShowcase/VideoGallery'
import { VideoCarousel } from './VideoShowcase/VideoCarousel'
import { VideoReelFeed } from './VideoShowcase/VideoReelFeed'
import { ImmersiveOverlay } from './VideoShowcase/ImmersiveOverlay'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import { AmbientBackground } from '@/components/ui/AmbientBackground'
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

  const videoLayout = useVideoLayout()
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const isVideoTab = activeTab?.type === 'video'
  const showcase = !!isVideoTab && videoLayout !== 'immersive'
  const immersive = !!isVideoTab && videoLayout === 'immersive'

  const storedTheme = useSyncExternalStore(subscribePubTheme, getPubTheme, () => null)
  const theme: Theme = storedTheme ?? profile.theme
  function toggleTheme() {
    setPubTheme(theme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    const t = setTimeout(() => setShowCard(true), 4000)
    return () => clearTimeout(t)
  }, [activeTabId])

  const cardProps = { profile, tabs, activeTabId, setActiveTabId, handleLinkClick }

  return (
    <LazyMotion features={domAnimation}>
      <div
        data-theme={theme}
        className={cn(
          'relative bg-app-bg',
          showcase
            ? 'min-h-dvh w-full overflow-x-hidden'
            : 'flex h-dvh flex-col items-center justify-center overflow-hidden',
        )}
        style={{ ['--accent-glow' as string]: profile.accent }}
      >
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="fixed right-4 top-4 z-40 grid h-9 w-9 place-items-center rounded-full border border-hairline-strong bg-surface text-fg-muted backdrop-blur-md transition hover:text-fg"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {isVideoTab && <LayoutSwitcher value={videoLayout} />}

        {showcase ? (
          <>
            <AmbientBackground />
            <div className="relative z-10 flex w-full flex-col items-center gap-8 px-4 pb-20 pt-20">
              <ProfileCard reveal {...cardProps} />
              {activeTab &&
                (videoLayout === 'gallery' ? (
                  <VideoGallery videos={activeTab.media} />
                ) : (
                  <VideoCarousel videos={activeTab.media} />
                ))}
            </div>
          </>
        ) : (
          <>
            {tabs.map((tab) =>
              everActivated.has(tab.id) ? (
                <div
                  key={tab.id}
                  className={
                    tab.id === activeTabId ? 'visible' : 'invisible fixed inset-0 pointer-events-none'
                  }
                >
                  {tab.type === 'video' ? (
                    tab.id === activeTabId && immersive ? (
                      <VideoReelFeed videos={tab.media} />
                    ) : null
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

            {immersive ? (
              <ImmersiveOverlay {...cardProps} />
            ) : (
              <div
                className="relative z-10 flex flex-col items-center justify-center"
                style={{
                  visibility: showCard ? 'visible' : 'hidden',
                  pointerEvents: showCard ? 'auto' : 'none',
                }}
              >
                <ProfileCard reveal={showCard} {...cardProps} />
              </div>
            )}
          </>
        )}

        <BrandFooter overlay />
        <div aria-hidden className="grain-overlay" />
      </div>
    </LazyMotion>
  )
}
