'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input, inputBase } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/types/dashboard'
import { useProfileSection } from './useProfileSection'

const SWATCHES = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171']

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
    avatarUrl,
    msg,
    fileRef,
    saveProfile,
    saveUsername,
    onAvatar,
  } = useProfileSection(data)

  return (
    <Card title="Profile" desc="How your page introduces you.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-white/[0.06]">
            {avatarUrl && <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="64px" />}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
            <Button variant="glass" onClick={() => fileRef.current?.click()}>
              Change avatar
            </Button>
          </div>
        </div>

        <Field label="Username (your public URL)">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-white/10 bg-white/[0.06] pl-3">
              <span className="text-sm text-white/35">/</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="h-10 flex-1 bg-transparent px-1 text-[15px] text-white outline-none"
              />
            </div>
            <Button variant="glass" onClick={saveUsername} disabled={pending}>
              Save
            </Button>
          </div>
        </Field>

        <Field label="Display name">
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className={cn(inputBase, 'h-auto resize-none py-2')}
          />
        </Field>

        <Field label="Accent color">
          <div className="flex items-center gap-2">
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                className={`h-7 w-7 rounded-full border ${accent === c ? 'border-white' : 'border-white/20'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-white/20 bg-transparent"
            />
          </div>
        </Field>

        <div className="flex items-center gap-3">
          <Button variant="glassPrimary" onClick={saveProfile} disabled={pending}>
            Save profile
          </Button>
          {msg && <span className="text-sm text-white/55">{msg}</span>}
        </div>
      </div>
    </Card>
  )
}
