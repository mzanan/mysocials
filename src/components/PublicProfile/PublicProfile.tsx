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
import {
  PersonalBackground,
  ValorantBackground,
  DevBackground,
  TradingBackground,
} from './Backgrounds'
import { preloadAllData } from '@/lib/preload'

export function PublicProfile() {
  const { profile, links, categories, activeCategory, setActiveCategory, handleLinkClick } = usePublicProfile()

  useEffect(() => {
    preloadAllData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div className={activeCategory === 'Personal' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
        <PersonalBackground isActive={activeCategory === 'Personal'} />
      </div>
      <div className={activeCategory === 'Valorant' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
        <ValorantBackground isActive={activeCategory === 'Valorant'} />
      </div>
      <div className={activeCategory === 'Dev' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
        <DevBackground isActive={activeCategory === 'Dev'} />
      </div>
      <div className={activeCategory === 'Trading' ? 'visible' : 'invisible fixed inset-0 pointer-events-none'}>
        <TradingBackground isActive={activeCategory === 'Trading'} />
      </div>
      <div className="max-w-md px-4 py-8 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {profile.full_name}
            </h1>
            {profile.bio && (
              <p className="text-gray-600 text-sm whitespace-pre-line">{profile.bio}</p>
            )}
          </div>

          <Tabs value={activeCategory} onValueChange={(value: string) => setActiveCategory(value as 'Personal' | 'Valorant' | 'Dev' | 'Trading')} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="space-y-3">
                {links.length > 0 ? (
                  links.map((link: Link) => (
                    <Tooltip key={link.url}>
                      <TooltipTrigger asChild>
                        <Button
                          key={link.url}
                          variant="outline"
                          className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 border-2 flex items-center gap-3 justify-start px-4"
                          disabled={link.disabled}
                          onClick={() => !link.disabled ? handleLinkClick(link.url) : null}
                        >
                          {link.icon ? (
                            <div className="w-8 h-8 flex items-center justify-center text-2xl">
                              {link.icon}
                            </div>
                          ) : link.icon_url ? (
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
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
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Working on it...
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="text-center mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold">Matias Zanan</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 