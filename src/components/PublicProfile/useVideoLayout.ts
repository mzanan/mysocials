'use client'

import { useSyncExternalStore } from 'react'

export type VideoLayout = 'immersive' | 'gallery' | 'carousel'

const KEY = 'ms-video-layout'
const DEFAULT: VideoLayout = 'gallery'
const listeners = new Set<() => void>()

function isLayout(v: string | null): v is VideoLayout {
  return v === 'immersive' || v === 'gallery' || v === 'carousel'
}

function read(): VideoLayout {
  try {
    const v = localStorage.getItem(KEY)
    return isLayout(v) ? v : DEFAULT
  } catch {
    return DEFAULT
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function setVideoLayout(next: VideoLayout) {
  try {
    localStorage.setItem(KEY, next)
  } catch {}
  listeners.forEach((l) => l())
}

export function useVideoLayout(): VideoLayout {
  return useSyncExternalStore(subscribe, read, () => DEFAULT)
}
