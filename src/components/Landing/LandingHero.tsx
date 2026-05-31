'use client'

import { LazyMotion, domAnimation, m } from 'motion/react'
import { SyntheticGrid } from './SyntheticGrid'
import { HeroCard } from './HeroCard'

export function LandingHero({ isAuthed = false }: { isAuthed?: boolean }) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-app-bg">
        <SyntheticGrid />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_22%,rgba(0,0,0,0.72)_100%)]"
        />
        <m.div
          className="relative z-10 w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_24px_70px_-25px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
          <HeroCard className="relative p-8" isAuthed={isAuthed} />
        </m.div>
        <div aria-hidden className="grain-overlay" />
      </div>
    </LazyMotion>
  )
}
