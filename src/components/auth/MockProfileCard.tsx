import Image from 'next/image'
import { NetworkIcon } from '@/components/SocialIcon/NetworkIcon'
import type { NetworkSlug } from '@/lib/networks'
import { cn } from '@/lib/utils'

export interface MockLink {
  slug: NetworkSlug
  label: string
}

export function MockProfileCard({
  name,
  handle,
  avatar,
  links,
  className,
}: {
  name: string
  handle: string
  avatar: string
  links: MockLink[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-56 rounded-3xl border border-hairline bg-surface p-4 backdrop-blur-xl',
        className,
      )}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-hairline-strong">
          <Image src={avatar} alt="" fill sizes="56px" className="object-cover" />
        </div>
        <div className="mt-2 text-sm font-semibold text-fg">{name}</div>
        <div className="text-xs text-fg-subtle">{handle}</div>
      </div>
      <div className="mt-3 space-y-1.5">
        {links.map((l) => (
          <div
            key={l.label}
            className="flex h-8 items-center gap-2 rounded-xl border border-hairline bg-surface-strong px-2.5 text-xs font-medium text-fg"
          >
            <NetworkIcon slug={l.slug} size={14} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  )
}
