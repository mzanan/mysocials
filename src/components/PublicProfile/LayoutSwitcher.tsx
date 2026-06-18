'use client'

import { Segmented } from '@/components/ui/segmented'
import { setVideoLayout, type VideoLayout } from './useVideoLayout'

const OPTIONS = [
  { value: 'gallery', label: 'Grid' },
  { value: 'carousel', label: 'Row' },
  { value: 'immersive', label: 'Reel' },
] as const

export function LayoutSwitcher({ value }: { value: VideoLayout }) {
  return (
    <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2">
      <Segmented
        size="sm"
        aria-label="Video layout"
        value={value}
        onChange={setVideoLayout}
        options={OPTIONS}
        className="border-hairline-strong bg-surface/80 backdrop-blur-md"
      />
    </div>
  )
}
