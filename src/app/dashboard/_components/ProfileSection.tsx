'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { Textarea } from '@/components/ui/textarea'
import { ACCENT_PRESETS, THEMES } from '@/lib/appearance'
import type { DashboardData, DashMedia } from '@/types/dashboard'
import { AvatarSection } from './AvatarSection'
import { useProfileSection } from './useProfileSection'

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
    theme,
    setTheme,
    username,
    setUsername,
    saveProfile,
    saveUsername,
  } = useProfileSection(data)

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

        <Field label="Accent color">
          <div className="flex items-center gap-2">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setAccent(c)
                  saveProfile({ accent: c })
                }}
                className={`h-7 w-7 rounded-full border ${accent === c ? 'border-fg' : 'border-hairline-strong'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              onBlur={() => saveProfile()}
              className="h-7 w-9 cursor-pointer rounded border border-hairline-strong bg-transparent"
            />
          </div>
        </Field>

        <Field label="Page theme">
          <Segmented
            aria-label="Page theme"
            value={theme}
            onChange={(v) => {
              setTheme(v)
              saveProfile({ theme: v })
            }}
            options={THEMES}
          />
        </Field>
      </div>
    </Card>
  )
}
