'use client'

import { Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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

function getImageMedia(data: DashboardData): DashMedia[] {
  return data.tabs.flatMap((t) => t.media).filter((m) => m.kind === 'image')
}

export function ProfileSection({ data }: { data: DashboardData }) {
  const {
    pending,
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

  const isCustomAccent = !ACCENT_PRESETS.includes(accent)

  return (
    <Card title="Profile" desc="How your page introduces you.">
      <div className="flex flex-col gap-4">
        <AvatarSection
          initialUrl={data.avatarUrl}
          instagramConnected={data.instagramConnected}
          imageMedia={getImageMedia(data)}
        />

        <Field label="Username (your public URL)">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-hairline bg-surface pl-3">
              <span className="text-sm text-fg-faint">/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="h-10 flex-1 bg-transparent px-1 text-[15px] text-fg outline-none"
              />
            </div>
            <Button variant="secondary" onClick={saveUsername} disabled={pending}>
              Save
            </Button>
          </div>
        </Field>

        <Field label="Display name">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => saveProfile()}
          />
        </Field>

        <Field label="Bio">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            onBlur={() => saveProfile()}
            rows={2}
          />
        </Field>

        <Field label="Accent">
          <div className="flex flex-wrap items-center gap-2.5">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Accent ${c}`}
                onClick={() => {
                  setAccent(c)
                  saveProfile({ accent: c })
                }}
                className={cn(
                  'relative grid h-9 w-9 place-items-center rounded-full transition',
                  accent === c
                    ? 'ring-2 ring-fg ring-offset-2 ring-offset-app-bg'
                    : 'ring-1 ring-hairline-strong hover:scale-105',
                )}
                style={{ backgroundColor: c }}
              >
                {accent === c && <Check size={16} className="text-white drop-shadow" />}
              </button>
            ))}
            <label
              aria-label="Custom accent"
              className={cn(
                'relative grid h-9 w-9 cursor-pointer place-items-center rounded-full transition hover:scale-105',
                isCustomAccent ? 'ring-2 ring-fg ring-offset-2 ring-offset-app-bg' : 'ring-1 ring-hairline-strong',
              )}
              style={{ background: RAINBOW }}
            >
              <Plus size={14} className="text-white mix-blend-difference" />
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                onBlur={() => saveProfile()}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </div>
        </Field>
      </div>
    </Card>
  )
}
