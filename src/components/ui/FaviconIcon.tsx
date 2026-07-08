'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Globe } from 'lucide-react'
import { faviconSources } from '@/lib/linkIcons'
import { cn } from '@/lib/utils'

export function FaviconIcon({
  url,
  size = 22,
  className,
}: {
  url: string
  size?: number
  className?: string
}) {
  const sources = faviconSources(url)
  const [idx, setIdx] = useState(0)

  if (idx >= sources.length) {
    return <Globe size={size} strokeWidth={1.8} className={cn('text-fg-muted', className)} />
  }

  return (
    <Image
      key={sources[idx]}
      src={sources[idx]}
      alt=""
      width={size}
      height={size}
      unoptimized
      onError={() => setIdx((i) => i + 1)}
      className={cn('rounded object-contain', className)}
    />
  )
}
