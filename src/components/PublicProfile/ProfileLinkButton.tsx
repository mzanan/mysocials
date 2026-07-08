'use client'

import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialIcon, isSocialUrl } from '@/components/SocialIcon/SocialIcon'
import { FaviconIcon } from '@/components/ui/FaviconIcon'
import { LINK_ICONS } from '@/lib/linkIcons'
import { iconContainerClasses } from './usePublicProfile'
import type { LinkPublic } from '@/types/profile'

export function ProfileLinkButton({ link, onClick }: { link: LinkPublic; onClick: () => void }) {
  const Icon = link.icon ? LINK_ICONS[link.icon] : null

  return (
    <Button
      variant="secondary"
      className="group link-btn flex h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-2xl px-4 text-base font-medium backdrop-blur-md"
      onClick={onClick}
    >
      <span className={`${iconContainerClasses} text-fg-muted`}>
        {Icon ? (
          <Icon size={22} strokeWidth={1.8} />
        ) : isSocialUrl(link.url) ? (
          <SocialIcon url={link.url} size={22} />
        ) : (
          <FaviconIcon url={link.url} size={22} />
        )}
      </span>
      <span className="flex-1 text-left">{link.title}</span>
      <ChevronRight className="link-chev size-5 -translate-x-1 text-fg-subtle opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
    </Button>
  )
}
