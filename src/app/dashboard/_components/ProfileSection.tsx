'use client'

import { useSyncExternalStore } from 'react'
import { Check, ChevronRight, Link2, Plus } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ACCENT_PRESETS } from '@/lib/appearance'
import { cn } from '@/lib/utils'
import type { DashboardData, DashMedia } from '@/types/dashboard'
import { AvatarSection } from './AvatarSection'
import { useProfileSection } from './useProfileSection'

const RAINBOW =
  'conic-gradient(from 0deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa, #f472b6, #f87171)'

const ACCENT_HINT_KEY = 'ms-accent-hint'
const accentHintListeners = new Set<() => void>()
function subscribeAccentHint(cb: () => void) {
  accentHintListeners.add(cb)
  return () => accentHintListeners.delete(cb)
}
function accentHintSeen(): boolean {
  try {
    return localStorage.getItem(ACCENT_HINT_KEY) === '1'
  } catch {
    return true
  }
}
function dismissAccentHint() {
  try {
    localStorage.setItem(ACCENT_HINT_KEY, '1')
  } catch {}
  accentHintListeners.forEach((l) => l())
}

function getImageMedia(data: DashboardData): DashMedia[] {
  return data.tabs.flatMap((t) => t.media).filter((m) => m.kind === 'image')
}

function AccentField({
  accent,
  setAccent,
  save,
}: {
  accent: string
  setAccent: (c: string) => void
  save: (patch?: { accent?: string }) => void
}) {
  const isCustom = !ACCENT_PRESETS.includes(accent)
  const showHint = !useSyncExternalStore(subscribeAccentHint, accentHintSeen, () => true)

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center sm:gap-8">
      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-medium text-fg-subtle">Accent color</span>
        <div className="flex max-w-xs flex-wrap items-center gap-2.5">
          {ACCENT_PRESETS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Accent ${c}`}
            onClick={() => {
              setAccent(c)
              save({ accent: c })
            }}
            className={cn(
              'relative grid h-8 w-8 place-items-center rounded-full transition',
              accent === c
                ? 'ring-2 ring-fg ring-offset-2 ring-offset-app-bg'
                : 'ring-1 ring-hairline-strong hover:scale-105',
            )}
            style={{ backgroundColor: c }}
          >
            {accent === c && <Check size={15} className="text-white drop-shadow" />}
          </button>
        ))}
        <label
          aria-label="Custom accent"
          className={cn(
            'relative grid h-8 w-8 cursor-pointer place-items-center rounded-full transition hover:scale-105',
            isCustom ? 'ring-2 ring-fg ring-offset-2 ring-offset-app-bg' : 'ring-1 ring-hairline-strong',
          )}
          style={{ background: RAINBOW }}
        >
          <Plus size={13} className="text-white mix-blend-difference" />
          <input
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            onBlur={() => save()}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
        </div>
      </div>

      <div className="relative w-full max-w-xs">
        {showHint && (
          <div className="absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-fg px-3 py-1.5 text-xs font-medium text-app-bg shadow-lg">
            This is how your links look
            <span className="absolute left-1/2 top-full size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-fg" />
          </div>
        )}
        <button
          type="button"
          onClick={dismissAccentHint}
          className="link-btn flex h-12 w-full items-center gap-3 rounded-2xl border bg-surface px-4 text-[15px] font-medium text-fg"
          style={{
            ['--accent-glow' as string]: accent,
            borderColor: 'color-mix(in oklab, var(--accent-glow) 42%, transparent)',
            boxShadow:
              '0 0 0 1px color-mix(in oklab, var(--accent-glow) 16%, transparent), 0 12px 30px -14px color-mix(in oklab, var(--accent-glow) 50%, transparent)',
          }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: 'color-mix(in oklab, var(--accent-glow) 16%, transparent)' }}
          >
            <Link2 size={16} style={{ color: 'var(--accent-glow)' }} />
          </span>
          <span className="flex-1 text-left">Sample link</span>
          <ChevronRight size={18} style={{ color: 'var(--accent-glow)' }} />
        </button>
      </div>
    </div>
  )
}

export function ProfileSection({ data }: { data: DashboardData }) {
  const {
    displayName,
    setDisplayName,
    bio,
    setBio,
    accent,
    setAccent,
    username,
    setUsername,
    saveProfile,
    saveUsername,
  } = useProfileSection(data)

  return (
    <div className="flex flex-col gap-5">
      <AvatarSection
        initialUrl={data.avatarUrl}
        instagramConnected={data.instagramConnected}
        imageMedia={getImageMedia(data)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Username (your public URL)">
          <div className="flex h-10 items-center rounded-xl border border-hairline-strong bg-surface-strong px-3 transition focus-within:border-accent focus-within:bg-surface-stronger focus-within:ring-2 focus-within:ring-accent/25">
            <span className="text-sm text-fg-faint">/</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              onBlur={saveUsername}
              className="h-full w-full min-w-0 flex-1 bg-transparent px-1 text-[15px] text-fg outline-none"
            />
          </div>
        </Field>

        <Field label="Display name">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => saveProfile()}
          />
        </Field>
      </div>

      <Field label="Bio">
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} onBlur={() => saveProfile()} rows={2} />
      </Field>

      <AccentField accent={accent} setAccent={setAccent} save={saveProfile} />
    </div>
  )
}
