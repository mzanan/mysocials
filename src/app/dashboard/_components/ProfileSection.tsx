'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateProfile, updateUsername } from '../actions'
import { Card, Field, btnCls, btnPrimaryCls, inputCls } from './ui'
import type { DashboardData } from './types'

const SWATCHES = ['#a78bfa', '#f472b6', '#60a5fa', '#34d399', '#fbbf24', '#f87171']

export function ProfileSection({ data }: { data: DashboardData }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [displayName, setDisplayName] = useState(data.displayName ?? '')
  const [bio, setBio] = useState(data.bio ?? '')
  const [accent, setAccent] = useState(data.accent)
  const [username, setUsername] = useState(data.username)
  const [avatarUrl, setAvatarUrl] = useState(data.avatarUrl)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function saveProfile() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateProfile({ displayName: displayName || null, bio: bio || null, accent })
      setMsg(res.ok ? 'Saved' : res.error)
      if (res.ok) router.refresh()
    })
  }

  function saveUsername() {
    setMsg(null)
    startTransition(async () => {
      const res = await updateUsername(username)
      setMsg(res.ok ? 'Username updated' : res.error)
      if (res.ok) router.refresh()
    })
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
    if (res.ok) {
      const { url } = await res.json()
      setAvatarUrl(url)
      router.refresh()
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Card title="Profile" desc="How your page introduces you.">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/15 bg-white/[0.06]">
            {avatarUrl && <Image src={avatarUrl} alt="avatar" fill className="object-cover" sizes="64px" />}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatar} />
            <button className={btnCls} onClick={() => fileRef.current?.click()}>
              Change avatar
            </button>
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
            <button className={btnCls} onClick={saveUsername} disabled={pending}>
              Save
            </button>
          </div>
        </Field>

        <Field label="Display name">
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={2}
            className={`${inputCls} h-auto resize-none py-2`}
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
          <button className={btnPrimaryCls} onClick={saveProfile} disabled={pending}>
            Save profile
          </button>
          {msg && <span className="text-sm text-white/55">{msg}</span>}
        </div>
      </div>
    </Card>
  )
}
