'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Instagram, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DashMedia } from '@/types/dashboard'
import { MediaPicker } from './MediaPicker'
import { useAvatar } from './useAvatar'

export function AvatarSection({
  initialUrl,
  instagramConnected,
  imageMedia,
}: {
  initialUrl: string | null
  instagramConnected: boolean
  imageMedia: DashMedia[]
}) {
  const { avatarUrl, busy, msg, fileRef, uploadFile, useInstagramAvatar, pickFromMedia } =
    useAvatar(initialUrl)
  const [pickerOpen, setPickerOpen] = useState(false)

  async function onPick(id: string) {
    setPickerOpen(false)
    await pickFromMedia(id)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-hairline-strong bg-surface">
        {avatarUrl && (
          <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="64px" />
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadFile} />
        <div className="flex flex-wrap gap-1.5">
          <Button variant="secondary" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? 'Updating…' : 'Upload'}
          </Button>
          {instagramConnected && (
            <Button variant="secondary" disabled={busy} onClick={useInstagramAvatar}>
              <Instagram size={14} /> Use Instagram avatar
            </Button>
          )}
          {imageMedia.length > 0 && (
            <Button variant="secondary" disabled={busy} onClick={() => setPickerOpen(true)}>
              <Images size={14} /> Pick from photos
            </Button>
          )}
        </div>
        {msg && <span className="text-xs text-fg-subtle">{msg}</span>}
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        media={imageMedia}
        onPick={onPick}
      />
    </div>
  )
}
