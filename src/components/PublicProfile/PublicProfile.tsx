'use client'

import { useEffect } from 'react'
import { usePublicProfile } from './usePublicProfile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from '@/types/link'
import { SocialIcon } from 'react-social-icons'
import Image from 'next/image'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { preloadAllData } from '@/lib/preload'
import { backgrounds, iconContainerClasses, Category } from './usePublicProfile'

export function PublicProfile() {
  const { profile, links, categories, activeCategory, setActiveCategory, handleLinkClick } = usePublicProfile()

  useEffect(() => {
    preloadAllData()
  }, [])

  return (
    <div className="h-dvh flex flex-col items-center justify-center relative overflow-hidden">
      {backgrounds.map(({ key, Component }) => (
        <div key={key} className={activeCategory === key ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
          <Component isActive={activeCategory === key} />
        </div>
      ))}
      <div className="max-w-md px-4 py-8 relative z-10 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <div className="bg-white/20 backdrop-blur-xs rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
              {profile.full_name}
            </h1>
            {profile.bio && (
              <p className="text-white text-sm whitespace-pre-line drop-shadow-md">{profile.bio}</p>
            )}
          </div>

          <Tabs value={activeCategory} onValueChange={(value: string) => setActiveCategory(value as Category)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-white/20 backdrop-blur-xs">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className='hover:bg-white/50'>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {links.map((link: Link) => (
                    <Tooltip key={link.url}>
                      <TooltipTrigger asChild>
                        <Button
                          key={link.url}
                          variant="outline"
                          className="w-full h-14 text-lg font-medium bg-white/50 flex items-center gap-3 justify-start px-4"
                          disabled={link.disabled}
                          onClick={() => !link.disabled ? handleLinkClick(link.url) : null}
                        >
                          {link.icon ? (
                            <div className={`${iconContainerClasses} text-2xl`}>
                              {link.icon}
                            </div>
                          ) : link.icon_url ? (
                            <div className={`${iconContainerClasses} bg-black rounded-full`}>
                              <Image
                                src={link.icon_url}
                                alt={`${link.title} icon`}
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <SocialIcon
                              url={link.url}
                              style={{ height: 32, width: 32 }}
                            />
                          )}
                          <span className="flex-1 text-left">{link.title}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{link.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))
              }
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-white drop-shadow-md">
              Powered by <span className="font-semibold">Matias Zanan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 