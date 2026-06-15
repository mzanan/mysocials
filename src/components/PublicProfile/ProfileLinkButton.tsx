'use client'

import Image from 'next/image'
import { ChevronRight, ShoppingBag, ShoppingCart, Code, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SocialIcon } from '@/components/SocialIcon/SocialIcon'
import { iconContainerClasses } from './usePublicProfile'
import type { LinkPublic } from '@/types/profile'

const linkIcons: Record<string, LucideIcon> = {
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  code: Code,
}

export function ProfileLinkButton({ link, onClick }: { link: LinkPublic; onClick: () => void }) {
  const Icon = link.icon ? linkIcons[link.icon] : null

  return (
    <Button
      variant="secondary"
      className="group link-btn flex h-14 w-full cursor-pointer items-center justify-start gap-3 rounded-2xl px-4 text-base font-medium backdrop-blur-md"
      onClick={onClick}
    >
      {Icon ? (
        <span className={`${iconContainerClasses} text-fg-muted`}>
          <Icon size={22} strokeWidth={1.8} />
        </span>
      ) : link.iconUrl ? (
        <div className={`${iconContainerClasses} rounded-full bg-black`}>
          <Image
            src={link.iconUrl}
            alt={`${link.title} icon`}
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
      ) : (
        <span className={`${iconContainerClasses} text-fg-muted`}>
          <SocialIcon url={link.url} size={22} />
        </span>
      )}
      <span className="flex-1 text-left">{link.title}</span>
      <ChevronRight className="link-chev size-5 -translate-x-1 text-fg-subtle opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
    </Button>
  )
}
