'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function HeroCard({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-5 text-center ${className}`}>
      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium tracking-wide text-white/70">
        Your link in bio, alive
      </span>
      <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-white drop-shadow-md">
        One page for all your
        <br />
        socials — beautifully alive.
      </h1>
      <p className="max-w-xs text-sm leading-relaxed text-white/65">
        Your photos and videos become a living background. Loads instantly. Looks unreal.
      </p>
      <div className="mt-1 flex w-full max-w-xs flex-col gap-2.5">
        <Button asChild variant="glassPrimary" className="link-btn h-11 w-full rounded-xl text-[15px]">
          <Link href="/signup">Create your page</Link>
        </Button>
        <Button asChild variant="glass" className="h-11 w-full rounded-xl text-[15px]">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </div>
  )
}
