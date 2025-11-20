'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { getBrowserCache, setBrowserCache } from '@/lib/browser-cache'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: [0, 0, 0.2, 1] as const,
        },
    },
}

interface PersonalBackgroundProps {
    isActive: boolean
}

export function PersonalBackground({ isActive }: PersonalBackgroundProps) {
    const [images, setImages] = useState<string[]>([])
    const [animationKey, setAnimationKey] = useState(0)

    useEffect(() => {
        if (isActive) {
            setAnimationKey(prev => prev + 1)
        }
    }, [isActive])

    useEffect(() => {
        const fetchImages = async () => {
            // Check browser cache first
            const cached = getBrowserCache<string[]>('instagram_images')
            if (cached && cached.length > 0) {
                let repeatedImages: string[] = []
                while (repeatedImages.length < 40) {
                    repeatedImages = [...repeatedImages, ...cached]
                }
                setImages(repeatedImages.slice(0, 40))
                return
            }

            // Fetch from API if not cached
            try {
                const response = await fetch('/api/instagram')
                const data = await response.json()
                if (data.images && data.images.length > 0) {
                    // Cache the images
                    setBrowserCache('instagram_images', data.images)
                    
                    let repeatedImages: string[] = []
                    while (repeatedImages.length < 40) {
                        repeatedImages = [...repeatedImages, ...data.images]
                    }
                    setImages(repeatedImages.slice(0, 40))
                }
            } catch (error) {
                console.error('Error fetching Instagram images:', error)
            }
        }

        fetchImages()
    }, [])

    if (images.length === 0) {
        return (
            <div className="fixed inset-0 overflow-hidden z-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
                <div className="text-white/30">Loading Instagram...</div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 overflow-hidden z-0">
            <motion.div
                className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 p-1"
                variants={containerVariants}
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
                key={animationKey}
            >
                {images.map((image, index) => (
                    <motion.div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-sm"
                        variants={itemVariants}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Image
                            src={image}
                            alt={`Instagram post ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16.66vw, 12.5vw"
                        />
                    </motion.div>
                ))}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
        </div>
    )
}

