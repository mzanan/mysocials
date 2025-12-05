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
import { backgrounds, iconContainerClasses } from './usePublicProfile'
import { Category } from '@/types/profile'
import { motion, AnimatePresence } from 'framer-motion'

export function PublicProfile() {
  const { profile, bio, links, categories, activeCategory, setActiveCategory, handleLinkClick } = usePublicProfile()

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
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="bg-white/0 backdrop-blur-xs rounded-3xl shadow-xl p-8">
          <div className="flex md:flex-col-reverse items-center justify-center pb-4">
            <div className='flex flex-col gap-2 text-center'>
              <h1 className="text-2xl font-bold text-white drop-shadow-md">
                {profile.full_name}
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeCategory}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  className="text-white text-sm whitespace-pre-line drop-shadow-md"
                >
                  {bio}
                </motion.p>
              </AnimatePresence>
            </div>
            <Avatar className="w-24 h-24 mx-auto md:mb-2">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              )}
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
                        className="flex items-center gap-3 justify-start px-4 cursor-pointer
                                  w-full h-14 text-lg font-medium bg-white/50"
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
        </div>
      </div>
    </div>
  )
} 