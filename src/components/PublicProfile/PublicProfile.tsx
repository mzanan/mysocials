'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { usePublicProfile } from './usePublicProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/types/link'
import { SocialIcon } from '@/components/SocialIcon/SocialIcon'
import Image from 'next/image'
import { ChevronRight, ShoppingBag, ShoppingCart, Code, type LucideIcon } from 'lucide-react'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import { iconContainerClasses } from './usePublicProfile'
import { Category } from '@/types/profile'
import { LazyMotion, domAnimation, m, AnimatePresence } from 'motion/react'

const DevBackground = dynamic(
  () => import('@/components/Backgrounds/DevBackground/DevBackground').then(m => ({ default: m.DevBackground })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gradient-to-br from-[#15151f] via-[#16131d] to-[#0e0e16]" />
    ),
  }
)

const linkIcons: Record<string, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  code: Code,
}

export function PublicProfile({ initialImages }: { initialImages: string[] }) {
  const { profile, bio, links, categories, activeCategory, setActiveCategory, handleLinkClick } = usePublicProfile()

  const everActivatedRef = useRef<Set<Category>>(new Set([activeCategory]))
  everActivatedRef.current.add(activeCategory)

  const [showCard, setShowCard] = useState(false)
  const revealCard = useCallback(() => setShowCard(true), [])
  const activeIndex = categories.indexOf(activeCategory)

  useEffect(() => {
    setShowCard(false)
    const t = setTimeout(() => setShowCard(true), 4000)
    return () => clearTimeout(t)
  }, [activeCategory])

  return (
    <LazyMotion features={domAnimation}>
    <div className="h-dvh flex flex-col items-center justify-center relative overflow-hidden bg-[#15151f]">
      {everActivatedRef.current.has('Personal') && (
        <div className={activeCategory === 'Personal' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
          <PersonalBackground isActive={activeCategory === 'Personal'} initialImages={initialImages} onReady={revealCard} />
        </div>
      )}
      {everActivatedRef.current.has('Dev') && (
        <div className={activeCategory === 'Dev' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
          <DevBackground isActive={activeCategory === 'Dev'} onReady={revealCard} />
        </div>
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
      <div
        className="relative z-10 flex flex-col items-center justify-center"
        style={{ visibility: showCard ? 'visible' : 'hidden', pointerEvents: showCard ? 'auto' : 'none' }}
      >
        <div className="relative rounded-3xl w-[340px] shadow-[0_24px_70px_-25px_rgba(0,0,0,0.8)]">
          <div className="absolute inset-0 rounded-3xl bg-white/[0.06] backdrop-blur-2xl border border-white/[0.12] [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
          <m.div
            className="relative p-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: showCard ? 1 : 0, y: showCard ? 0 : 12 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
          <div className="flex md:flex-col-reverse items-center justify-center pb-4">
            <div className='flex flex-col gap-2 text-center'>
              <h1 className="text-[1.7rem] font-semibold tracking-tight text-white drop-shadow-md">
                {profile.full_name}
              </h1>
              <AnimatePresence mode="wait">
                <m.p
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="text-white/75 text-sm tracking-wide whitespace-pre-line drop-shadow-md"
                >
                  {bio}
                </m.p>
              </AnimatePresence>
            </div>
            <Avatar className="w-24 h-24 mx-auto md:mb-2 ring-2 ring-white/15">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <Tabs value={activeCategory} onValueChange={(value: string) => setActiveCategory(value as Category)} className="w-full">
            <TabsList className="relative grid w-full grid-cols-2 mb-6 p-1 h-11 rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-md">
              <m.span
                aria-hidden
                className="absolute inset-y-1 left-1 rounded-lg bg-white/[0.14] border border-white/15 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                style={{ width: 'calc(50% - 0.25rem)' }}
                animate={{ x: `${activeIndex * 100}%` }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="relative z-10 bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none text-white/55 hover:text-white/80 data-[state=active]:text-white transition-colors"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {links.map((link: Link) => {
                  const Icon = link.icon ? linkIcons[link.icon] : null
                  return (
                  <Button
                    key={link.url}
                    variant="outline"
                    className="group link-btn flex items-center gap-3 justify-start px-4 cursor-pointer
                              w-full h-14 text-base font-medium rounded-2xl text-white
                              bg-white/[0.06] border-white/10 backdrop-blur-md"
                    disabled={link.disabled}
                    onClick={() => !link.disabled ? handleLinkClick(link.url) : null}
                  >
                    {Icon ? (
                      <span className={`${iconContainerClasses} text-white/85`}>
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                    ) : link.icon_url ? (
                      <div className={`${iconContainerClasses} bg-black rounded-full`}>
                        <Image
                          src={link.icon_url}
                          alt={`${link.title} icon`}
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <SocialIcon url={link.url} size={32} />
                    )}
                    <span className="flex-1 text-left">{link.title}</span>
                    <ChevronRight className="link-chev size-5 text-white/40 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Button>
                  )
                })
                }
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