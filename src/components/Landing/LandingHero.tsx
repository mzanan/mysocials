'use client'

import Link from 'next/link'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { PersonalBackground } from '@/components/Backgrounds/PersonalBackground/PersonalBackground'
import { Button } from '@/components/ui/button'
import { DEMO_IMAGES } from '@/lib/demo-images'

export function LandingHero() {
  return (
    <LazyMotion features={domAnimation}>
      <div
        className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-app-bg"
        style={{ ['--accent-glow' as string]: '#a78bfa' }}
      >
        <PersonalBackground isActive initialImages={DEMO_IMAGES} />

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.7)_100%)]"
        />

        <m.div
          className="relative z-10 w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl shadow-[0_24px_70px_-25px_rgba(0,0,0,0.8)]"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute inset-0 rounded-3xl border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
          <div className="relative flex flex-col items-center gap-5 p-8 text-center">
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium tracking-wide text-white/70">
              Your link in bio, alive
            </span>
            <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-white drop-shadow-md">
              One page for all your
              <br />
              socials — beautifully alive.
            </h1>
            <p className="text-sm leading-relaxed text-white/65">
              Your own photos and videos become a living background. Loads instantly. Looks
              unreal.
            </p>
            <div className="mt-1 flex w-full flex-col gap-2.5">
              <Button
                asChild
                variant="glassPrimary"
                className="link-btn h-11 w-full rounded-xl text-[15px]"
              >
                <Link href="/signup">Create your page</Link>
              </Button>
              <Button asChild variant="glass" className="h-11 w-full rounded-xl text-[15px]">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </m.div>

        <div aria-hidden className="grain-overlay" />
      </div>
    </LazyMotion>
  )
}
