'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Instagram, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input, inputBase } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { DashboardData, DashMedia } from '@/types/dashboard'
import { useProfileSection } from './useProfileSection'

const SWATCHES = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171']

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
    avatarUrl,
    avatarBusy,
    avatarMsg,
    msg,
    fileRef,
    saveProfile,
    saveUsername,
    onAvatar,
    useInstagramAvatar,
    pickAvatarFromMedia,
  } = useProfileSection(data)

  const [pickerOpen, setPickerOpen] = useState(false)
  const imageMedia = getImageMedia(data)

  async function onPick(id: string) {
    setPickerOpen(false)
    await pickAvatarFromMedia(id)
  }

  return (
    <Card title="Profile" desc="How your page introduces you.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-hairline-strong bg-surface">
            {avatarUrl && <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="64px" />}
          </div>
          <div className="flex flex-col gap-1.5">
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
            <div className="flex flex-wrap gap-1.5">
              <Button variant="glass" disabled={avatarBusy} onClick={() => fileRef.current?.click()}>
                {avatarBusy ? 'Updating…' : 'Upload'}
              </Button>
              {data.instagramConnected && (
                <Button variant="glass" disabled={avatarBusy} onClick={useInstagramAvatar}>
                  <Instagram size={14} /> Use Instagram avatar
                </Button>
              )}
              {imageMedia.length > 0 && (
                <Button variant="glass" disabled={avatarBusy} onClick={() => setPickerOpen(true)}>
                  <Images size={14} /> Pick from photos
                </Button>
              )}
            </div>
            {avatarMsg && <span className="text-xs text-fg-subtle">{avatarMsg}</span>}
          </div>
        </div>

        {pickerOpen && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setPickerOpen(false)}
          >
            <div
              className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-hairline bg-surface p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-fg">Pick avatar from your photos</h3>
                <Button variant="glass" onClick={() => setPickerOpen(false)}>
                  Close
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {imageMedia.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => onPick(m.id)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-hairline-subtle bg-surface-subtle transition hover:border-accent"
                  >
                    <Image src={m.url} alt="" fill className="object-cover" sizes="120px" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

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
                className={`h-7 w-7 rounded-full border ${accent === c ? 'border-fg' : 'border-hairline-strong'}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <input
              type="color"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="h-7 w-9 cursor-pointer rounded border border-hairline-strong bg-transparent"
            />
          </div>
        </Field>

        <div className="flex items-center gap-3">
          <Button variant="glassPrimary" onClick={saveProfile} disabled={pending}>
            Save profile
          </Button>
          {msg && <span className="text-sm text-fg-subtle">{msg}</span>}
        </div>
      </div>
    </Card>
  )
}
